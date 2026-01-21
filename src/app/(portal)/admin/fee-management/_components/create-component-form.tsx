"use client"

import React, { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
// import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { SuccessModal } from "@/components/dashboard/success-modal"
import { useCreateFee as useCreateFeeComponent } from "../_hooks/use-fees"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { z } from "zod"

// ---------------- Zod Schema ----------------
const feeComponentSchema = z
  .object({
    component_name: z.string().min(2, "Component name is required"),
    description: z.string().optional(),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
    period_type: z.enum(["TERM", "SESSION"]),
    session_id: z.string().uuid().optional(),
    term_id: z.string().uuid().optional(),
    class_ids: z.array(z.string().uuid()).min(0),
  })
  .refine(
    (data) => {
      if (data.period_type === "TERM") {
        return !!data.term_id
      }
      return true
    },
    {
      message: "Term is required when period type is TERM",
      path: ["term_id"],
    }
  )
  .refine(
    (data) => {
      if (data.period_type === "SESSION") {
        return !!data.session_id
      }
      return true
    },
    {
      message: "Session is required when period type is SESSION",
      path: ["session_id"],
    }
  )

type FeeComponentFormValues = {
  component_name: string
  description?: string
  amount: string
  period_type: "TERM" | "SESSION"
  session_id?: string
  term_id?: string
  class_ids: string[]
}

// Add onSuccess prop
interface CreateComponentFormProps {
  onSuccess?: () => void
}

// ---------------- Component ----------------
export default function CreateComponentForm({ onSuccess }: CreateComponentFormProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])

  // Sessions
  const { data: sessions, isLoading: loadingSessions } = useAcademicSessions()

  // Terms for selected session
  const {
    data: terms,
    isLoading: loadingTerms,
    isError: termsError,
  } = useAcademicTermsForSession(selectedSession)

  // Classes
  const { data: classes, isLoading: loadingClasses } = useGetClassesInfo()

  const toggleClass = (id: string) => {
    const updated = selectedClassIds.includes(id)
      ? selectedClassIds.filter((c) => c !== id)
      : [...selectedClassIds, id]
    setSelectedClassIds(updated)
  }

  // Get all class IDs for "Select All" functionality
  const allClassIds = React.useMemo(() => {
    if (!classes?.items) return []
    return classes.items
      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
      .flatMap((clsItem) =>
        clsItem.classes.filter((cls) => cls?.id).map((cls) => cls.id)
      )
  }, [classes])

  const isAllSelected = allClassIds.length > 0 && selectedClassIds.length === allClassIds.length
  const isPartiallySelected = selectedClassIds.length > 0 && selectedClassIds.length < allClassIds.length

  // Get class IDs for each stream
  const streamClassIdsMap = React.useMemo(() => {
    const map = new Map<string, string[]>()
    if (!classes?.items) return map
    
    classes.items
      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
      .forEach((clsItem) => {
        const streamClassIds = clsItem.classes
          .filter((cls) => cls?.id)
          .map((cls) => cls.id)
        map.set(clsItem.name, streamClassIds)
      })
    return map
  }, [classes])

  // Check if a stream is fully selected
  const isStreamSelected = (streamName: string) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (streamClassIds.length === 0) return false
    return streamClassIds.every((id) => selectedClassIds.includes(id))
  }

  // Check if a stream is partially selected
  const isStreamPartiallySelected = (streamName: string) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (streamClassIds.length === 0) return false
    const selectedCount = streamClassIds.filter((id) => selectedClassIds.includes(id)).length
    return selectedCount > 0 && selectedCount < streamClassIds.length
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClassIds(allClassIds)
    } else {
      setSelectedClassIds([])
    }
  }

  const handleSelectStream = (streamName: string, checked: boolean) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (checked) {
      // Add all classes in the stream
      setSelectedClassIds((prev) => {
        const newIds = [...prev]
        streamClassIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id)
          }
        })
        return newIds
      })
    } else {
      // Remove all classes in the stream
      setSelectedClassIds((prev) => prev.filter((id) => !streamClassIds.includes(id)))
    }
  }

  const form = useForm<FeeComponentFormValues>({
    resolver: zodResolver(feeComponentSchema),
    defaultValues: {
      component_name: "",
      description: "",
      amount: "",
      period_type: "TERM",
      session_id: undefined,
      term_id: undefined,
      class_ids: [],
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = form
  const termId = useWatch({ control, name: "term_id" })
  const sessionId = useWatch({ control, name: "session_id" })
  const createComponent = useCreateFeeComponent()

  // Sync selectedClassIds with RHF
  useEffect(() => {
    setValue("class_ids", selectedClassIds)
  }, [selectedClassIds, setValue])

  const periodType = useWatch({ control, name: "period_type" })

  // Reset term/session when period type changes
  useEffect(() => {
    if (periodType === "TERM") {
      setValue("session_id", undefined)
      if (periodType === "TERM") {
        // For TERM type, we use selectedSession just to filter terms, not to set session_id
        // Reset term_id when period type changes to TERM
        setValue("term_id", undefined)
      }
    } else {
      setValue("term_id", undefined)
      setSelectedSession("") // Clear the session selector state for TERM filtering
    }
  }, [periodType, setValue])

  // Reset term when session changes (for TERM period type)
  useEffect(() => {
    if (selectedSession && periodType === "TERM") {
      setValue("term_id", undefined)
    }
  }, [selectedSession, periodType, setValue])

  const handleCancel = () => {
    reset()
    setSelectedClassIds([])
    setSelectedSession("")
    onSuccess?.() // Close the drawer
  }

  const onSubmit = async (values: FeeComponentFormValues) => {
    await createComponent.mutateAsync({
      component_name: values.component_name,
      description: values.description ?? "",
      amount: Number(values.amount),
      period_type: values.period_type,
      term_id: values.period_type === "TERM" ? values.term_id : undefined,
      session_id: values.period_type === "SESSION" ? values.session_id : undefined,
      class_ids: values.class_ids || [], // Ensure it's always an array (empty for school-wide fees)
    })
    reset()
    setSelectedClassIds([])
    setSelectedSession("")
    onSuccess?.() // Close the drawer after success
    setModalOpen(true) // Show success modal
  }

  useEffect(() => {
    console.log("Classes data:", classes)
    console.log("Loading classes:", loadingClasses)
  }, [classes, loadingClasses])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Component Name */}
        <div className="space-y-1">
          <Label>Fee Name</Label>
          <Input placeholder="Tuition Fee" {...register("component_name")} />
          {errors.component_name && (
            <p className="text-xs text-red-500">{errors.component_name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label>Description</Label>
          <Input placeholder="Optional" {...register("description")} />
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label>Amount</Label>
          <Input type="number" placeholder="Amount" {...register("amount")} />
          {errors.amount && (
            <p className="text-xs text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Period Type */}
        <div className="space-y-1">
          <Label>Fee Period Type</Label>
          <Select
            value={periodType || "TERM"}
            onValueChange={(value: "TERM" | "SESSION") => {
              setValue("period_type", value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select period type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TERM">Per Term</SelectItem>
              <SelectItem value="SESSION">Per Session</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {periodType === "TERM"
              ? "Fee applies to a specific term"
              : "Fee applies to the entire academic session"}
          </p>
          {errors.period_type && (
            <p className="text-xs text-red-500">{errors.period_type.message}</p>
          )}
        </div>

        {/* Session - Required for both TERM and SESSION (for term lookup) */}
        {periodType === "TERM" && (
          <div className="space-y-1">
            <Label>Academic Session</Label>
            {loadingSessions ? (
              <p className="text-sm text-gray-500">Loading sessions...</p>
            ) : sessions?.data?.length ? (
              <Select
                value={selectedSession}
                onValueChange={(value) => {
                  setSelectedSession(value)
                  // Don't set session_id for TERM period type
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.data.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-text-secondary text-sm">No sessions available</p>
            )}
          </div>
        )}

        {/* Term - Only shown when period_type is TERM */}
        {periodType === "TERM" && (
          <div className="space-y-1">
            <Label>Term</Label>
            {!selectedSession ? (
              <p className="text-sm text-gray-500">Please select a session first</p>
            ) : loadingTerms ? (
              <p className="text-sm text-gray-500">Loading terms...</p>
            ) : termsError ? (
              <p className="text-sm text-red-500">Error loading terms</p>
            ) : terms && terms.length > 0 ? (
              <Select value={termId} onValueChange={(value) => setValue("term_id", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-text-secondary text-sm">
                No terms available for this session
              </p>
            )}
            {errors.term_id && (
              <p className="text-xs text-red-500">{errors.term_id.message}</p>
            )}
          </div>
        )}

        {/* Session - Only shown when period_type is SESSION */}
        {periodType === "SESSION" && (
          <div className="space-y-1">
            <Label>Academic Session</Label>
            {loadingSessions ? (
              <p className="text-sm text-gray-500">Loading sessions...</p>
            ) : sessions?.data?.length ? (
              <Select
                value={sessionId || ""}
                onValueChange={(value) => {
                  setValue("session_id", value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.data.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-text-secondary text-sm">No sessions available</p>
            )}
            {errors.session_id && (
              <p className="text-xs text-red-500">{errors.session_id.message}</p>
            )}
          </div>
        )}

        {/* Classes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Fee Assignment</Label>
            <span className="text-xs text-gray-500">(Optional)</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Choose how this fee should be applied. Leave unselected to create an unassigned fee that can be assigned later to specific classes or students.
          </p>
          
          {loadingClasses ? (
            <p className="text-sm text-gray-500">Loading classes...</p>
          ) : classes?.items?.length ? (
            <div className="space-y-3">
              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 rounded-md border p-3 bg-gray-50/50">
                <Checkbox
                  id="select-all-classes"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isPartiallySelected ? "data-[state=checked]:bg-amber-500" : ""}
                />
                <label
                  htmlFor="select-all-classes"
                  className="cursor-pointer text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apply to All Classes (School-wide)
                </label>
                {isAllSelected && (
                  <span className="text-xs text-green-600 ml-2">✓ Selected</span>
                )}
              </div>

              {/* Stream Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select entire streams (all arms):</Label>
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-3">
                  {classes.items
                    .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
                    .map((clsItem) => {
                      const streamSelected = isStreamSelected(clsItem.name)
                      const streamPartiallySelected = isStreamPartiallySelected(clsItem.name)
                      const armCount = clsItem.classes.filter((cls) => cls?.id).length
                      
                      return (
                        <div key={`stream-${clsItem.name}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`stream-${clsItem.name}`}
                            checked={streamSelected}
                            onCheckedChange={(checked) => handleSelectStream(clsItem.name, checked as boolean)}
                            className={streamPartiallySelected ? "data-[state=checked]:bg-amber-500" : ""}
                          />
                          <label
                            htmlFor={`stream-${clsItem.name}`}
                            className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {clsItem.name || "Unknown"}
                            <span className="text-xs text-gray-500 ml-1">
                              ({armCount} arm{armCount !== 1 ? "s" : ""})
                            </span>
                          </label>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Individual Arm Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Or select specific arms:</Label>
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-2">
                  {classes.items
                    .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
                    .map((clsItem) => (
                      <div key={`group-${clsItem.name}`} className="space-y-1">
                        <div className="text-xs font-semibold text-gray-600 pb-1 border-b">
                          {clsItem.name}
                        </div>
                        {clsItem.classes
                          .filter((cls) => cls?.id)
                          .map((cls) => (
                            <div key={cls.id} className="flex items-center space-x-2 pl-2">
                              <Checkbox
                                id={cls.id}
                                checked={selectedClassIds.includes(cls.id)}
                                onCheckedChange={() => toggleClass(cls.id)}
                              />
                              <label
                                htmlFor={cls.id}
                                className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {cls.arm || "Default"}
                              </label>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              </div>

              {/* Status Messages */}
              {selectedClassIds.length === 0 && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-2">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Unassigned Fee:</span> This fee will be created without any class assignments. You can assign it to specific classes or students later.
                  </p>
                </div>
              )}
              {isAllSelected && (
                <div className="rounded-md border border-green-200 bg-green-50 p-2">
                  <p className="text-xs text-green-700">
                    <span className="font-medium">School-wide Fee:</span> This fee will apply to all classes in the school.
                  </p>
                </div>
              )}
              {isPartiallySelected && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                  <p className="text-xs text-amber-700">
                    <span className="font-medium">Partial Selection:</span> This fee will apply to {selectedClassIds.length} selected class{selectedClassIds.length > 1 ? "es" : ""} only.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                No classes available. This fee will be created as unassigned and can be assigned later.
              </p>
            </div>
          )}
          {errors.class_ids && (
            <p className="text-xs text-red-500">{errors.class_ids.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="lg" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={createComponent.isPending}>
            {createComponent.isPending ? "Saving..." : "Create Fee"}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Fee Created"
        message="The fee was successfully created."
        onAction={() => setModalOpen(false)}
      />
    </>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { toast } from "sonner"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"

// import { SuccessModal } from "@/components/dashboard/success-modal"
// import { useCreateFee as useCreateFeeComponent } from "../_hooks/use-fees"
// import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
// import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
// import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
// import { z } from "zod"

// // ---------------- Zod Schema ----------------
// const feeComponentSchema = z.object({
//   component_name: z.string().min(2, "Component name is required"),
//   description: z.string().optional(),
//   amount: z
//     .string()
//     .min(1, "Amount is required")
//     .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
//   session_id: z.string().uuid("Select a session"),
//   term_id: z.string().uuid("Select a term"),
//   class_ids: z.array(z.string().uuid()).min(1, "Select at least one class"),
// })

// type FeeComponentFormValues = z.infer<typeof feeComponentSchema>

// // ---------------- Component ----------------
// export default function CreateComponentForm() {
//   const [modalOpen, setModalOpen] = useState(false)
//   const [selectedSession, setSelectedSession] = useState<string>("")
//   const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])

//   // Sessions
//   const { data: sessions, isLoading: loadingSessions } = useAcademicSessions()

//   // Terms for selected session
//   const {
//     data: terms,
//     isLoading: loadingTerms,
//     isError: termsError,
//   } = useAcademicTermsForSession(selectedSession)

//   // Classes
//   const { data: classes, isLoading: loadingClasses } = useGetClassesInfo()

//   const toggleClass = (id: string) => {
//     const updated = selectedClassIds.includes(id)
//       ? selectedClassIds.filter((c) => c !== id)
//       : [...selectedClassIds, id]
//     setSelectedClassIds(updated)
//   }

//   const form = useForm<FeeComponentFormValues>({
//     resolver: zodResolver(feeComponentSchema),
//     defaultValues: {
//       component_name: "",
//       description: "",
//       amount: "",
//       session_id: "",
//       term_id: "",
//       class_ids: [],
//     },
//   })

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//     reset,
//   } = form
//   const createComponent = useCreateFeeComponent()

//   // Sync selectedClassIds with RHF
//   useEffect(() => {
//     setValue("class_ids", selectedClassIds)
//   }, [selectedClassIds, setValue])

//   // Reset term when session changes
//   useEffect(() => {
//     if (selectedSession) {
//       setValue("term_id", "")
//     }
//   }, [selectedSession, setValue])

//   const onSubmit = async (values: FeeComponentFormValues) => {
//     console.log("Submitting values:", values)
//     try {
//       await createComponent.mutateAsync({
//         component_name: values.component_name,
//         description: values.description ?? "",
//         amount: Number(values.amount),
//         term_id: values.term_id,
//         class_ids: values.class_ids,
//       })
//       reset()
//       setSelectedClassIds([])
//       setSelectedSession("")
//       setModalOpen(true)
//       toast.success("Fee component created successfully")
//       // console.log(values)
//     } catch (error) {
//       // console.error("Error creating fee component:", error)
//       toast.error("Failed to create fee component")
//     }
//   }

//   // Debug logs
//   // useEffect(() => {
//   //   console.log("Selected Session:", selectedSession)
//   //   console.log("Terms data:", terms)
//   //   console.log("Loading terms:", loadingTerms)
//   //   console.log("Terms error:", termsError)
//   // }, [selectedSession, terms, loadingTerms, termsError])

//   useEffect(() => {
//     console.log("Classes data:", classes)
//     console.log("Loading classes:", loadingClasses)
//   }, [classes, loadingClasses])

//   return (
//     <>
//       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//         {/* Component Name */}
//         <div className="space-y-1">
//           <Label>Component Name</Label>
//           <Input placeholder="Tuition Fee" {...register("component_name")} />
//           {errors.component_name && (
//             <p className="text-xs text-red-500">{errors.component_name.message}</p>
//           )}
//         </div>

//         {/* Description */}
//         <div className="space-y-1">
//           <Label>Description</Label>
//           <Input placeholder="Optional" {...register("description")} />
//         </div>

//         {/* Amount */}
//         <div className="space-y-1">
//           <Label>Amount</Label>
//           <Input type="number" placeholder="Amount" {...register("amount")} />
//           {errors.amount && (
//             <p className="text-xs text-red-500">{errors.amount.message}</p>
//           )}
//         </div>

//         {/* Session */}
//         <div className="space-y-1">
//           <Label>Academic Session</Label>
//           {loadingSessions ? (
//             <p className="text-sm text-gray-500">Loading sessions...</p>
//           ) : sessions?.data?.length ? (
//             <Select
//               value={selectedSession}
//               onValueChange={(value) => {
//                 // console.log("Session changed to:", value)
//                 setSelectedSession(value)
//                 setValue("session_id", value)
//               }}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select session" />
//               </SelectTrigger>
//               <SelectContent>
//                 {sessions.data.map((s) => (
//                   <SelectItem key={s.id} value={s.id}>
//                     {s.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <p className="text-text-secondary text-sm">No sessions available</p>
//           )}
//           {errors.session_id && (
//             <p className="text-xs text-red-500">{errors.session_id.message}</p>
//           )}
//         </div>

//         {/* Term */}
//         <div className="space-y-1">
//           <Label>Term</Label>
//           {!selectedSession ? (
//             <p className="text-sm text-gray-500">Please select a session first</p>
//           ) : loadingTerms ? (
//             <p className="text-sm text-gray-500">Loading terms...</p>
//           ) : termsError ? (
//             <p className="text-sm text-red-500">Error loading terms</p>
//           ) : terms && terms.length > 0 ? (
//             <Select
//               value={watch("term_id")}
//               onValueChange={(value) => setValue("term_id", value)}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select term" />
//               </SelectTrigger>
//               <SelectContent>
//                 {terms.map((t) => (
//                   <SelectItem key={t.id} value={t.id}>
//                     {t.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <p className="text-text-secondary text-sm">
//               No terms available for this session
//             </p>
//           )}
//           {errors.term_id && (
//             <p className="text-xs text-red-500">{errors.term_id.message}</p>
//           )}
//         </div>

//         {/* Classes */}
//         <div className="space-y-1">
//           <Label>Classes</Label>
//           {loadingClasses ? (
//             <p className="text-sm text-gray-500">Loading classes...</p>
//           ) : classes?.items?.length ? (
//             <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
//               {classes.items.map((clsItem) =>
//                 clsItem.classes.map((cls) => (
//                   <div key={cls.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={cls.id}
//                       checked={selectedClassIds.includes(cls.id)}
//                       onCheckedChange={() => toggleClass(cls.id)}
//                     />
//                     <label
//                       htmlFor={cls.id}
//                       className="cursor-pointer text-sm font-medium"
//                     >
//                       {clsItem.name} {cls.arm}
//                     </label>
//                   </div>
//                 ))
//               )}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-500">No classes available</p>
//           )}
//           {errors.class_ids && (
//             <p className="text-xs text-red-500">{errors.class_ids.message}</p>
//           )}
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             size="lg"
//             type="button"
//             onClick={() => {
//               reset()
//               setSelectedClassIds([])
//               setSelectedSession("")
//             }}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" size="lg" disabled={createComponent.isPending}>
//             {createComponent.isPending ? "Saving..." : "Create Component"}
//           </Button>
//         </div>
//       </form>

//       {/* Success Modal */}
//       <SuccessModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         title="Fee Component Created"
//         message="The fee component was successfully created."
//         onAction={() => setModalOpen(false)}
//       />
//     </>
//   )
// }
