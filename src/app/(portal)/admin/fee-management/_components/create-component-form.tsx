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
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, X } from "lucide-react"

import { SuccessModal } from "@/components/dashboard/success-modal"
import { useCreateFee as useCreateFeeComponent } from "../_hooks/use-fees"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { useQueryClient } from "@tanstack/react-query"
import { CLASS_KEYS } from "../../class-management/_hooks/use-classes"
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
  open?: boolean
}

// ---------------- Component ----------------
export default function CreateComponentForm({ onSuccess, open }: CreateComponentFormProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [classSearchQuery, setClassSearchQuery] = useState("")
  const queryClient = useQueryClient()

  // Sessions
  const { data: sessions, isLoading: loadingSessions } = useAcademicSessions()

  // Terms for selected session
  const {
    data: terms,
    isLoading: loadingTerms,
    isError: termsError,
  } = useAcademicTermsForSession(selectedSession)

  // Classes - refetch when drawer opens to ensure fresh data
  const { data: classes, isLoading: loadingClasses } = useGetClassesInfo()

  // Refetch classes when drawer opens to ensure fresh data
  useEffect(() => {
    if (open) {
      // Invalidate and refetch classes to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: CLASS_KEYS.all, exact: false })
      queryClient.refetchQueries({ queryKey: CLASS_KEYS.all, exact: false, type: "active" })
    }
  }, [open, queryClient])

  const toggleClass = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedClassIds((prev) => {
        if (prev.includes(id)) return prev
        return [...prev, id]
      })
    } else {
      setSelectedClassIds((prev) => prev.filter((c) => c !== id))
    }
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
      // Use functional update to ensure we get the latest allClassIds
      setSelectedClassIds(() => {
        if (!classes?.items) return []
        return classes.items
          .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
          .flatMap((clsItem) =>
            clsItem.classes.filter((cls) => cls?.id).map((cls) => cls.id)
          )
      })
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Fee Assignment</Label>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            {selectedClassIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedClassIds.length} {selectedClassIds.length === 1 ? "class" : "classes"} selected
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Choose how this fee should be applied. Leave unselected to create an unassigned fee that can be assigned later.
          </p>
          
          {loadingClasses ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">Loading classes...</p>
            </div>
          ) : classes?.items?.length ? (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={isAllSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectAll(!isAllSelected)}
                  className="text-xs"
                >
                  {isAllSelected ? "✓ All Selected" : "Select All Classes"}
                </Button>
                {selectedClassIds.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedClassIds([])
                      setClassSearchQuery("")
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear Selection
                  </Button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search classes by name or arm..."
                  value={classSearchQuery}
                  onChange={(e) => setClassSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {classSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setClassSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Selected Classes Summary */}
              {selectedClassIds.length > 0 && !isAllSelected && (
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-green-800">Selected Classes:</p>
                    <Badge variant="outline" className="text-xs bg-white">
                      {selectedClassIds.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {classes.items
                      .flatMap((item) => 
                        item.classes
                          .filter((cls) => selectedClassIds.includes(cls.id))
                          .map((cls) => ({
                            id: cls.id,
                            label: `${item.name} ${cls.arm || ""}`.trim(),
                            stream: item.name,
                          }))
                      )
                      .slice(0, 20)
                      .map((cls) => (
                        <Badge
                          key={cls.id}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-green-100"
                          onClick={() => toggleClass(cls.id, false)}
                        >
                          {cls.label}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    {selectedClassIds.length > 20 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedClassIds.length - 20} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Stream Selection - Quick Select */}
              {!isAllSelected && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Quick Select by Stream:</Label>
                  <div className="flex flex-wrap gap-2">
                    {classes.items
                      .filter((clsItem) => {
                        if (!clsItem?.name || !clsItem?.classes?.length) return false
                        if (classSearchQuery) {
                          const query = classSearchQuery.toLowerCase()
                          return clsItem.name.toLowerCase().includes(query) ||
                            clsItem.classes.some((c) => c.arm?.toLowerCase().includes(query))
                        }
                        return true
                      })
                      .map((clsItem) => {
                        const streamSelected = isStreamSelected(clsItem.name)
                        const streamPartiallySelected = isStreamPartiallySelected(clsItem.name)
                        const armCount = clsItem.classes.filter((cls) => cls?.id).length
                        
                        return (
                          <Button
                            key={`stream-btn-${clsItem.name}`}
                            type="button"
                            variant={streamSelected ? "default" : streamPartiallySelected ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleSelectStream(clsItem.name, !streamSelected)}
                            className="text-xs"
                          >
                            {streamPartiallySelected && "• "}
                            {clsItem.name}
                            <span className="ml-1 text-xs opacity-75">
                              ({armCount})
                            </span>
                          </Button>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Classes by Stream - Accordion */}
              {!isAllSelected && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Select Individual Classes:</Label>
                  <div className="rounded-lg border border-gray-200 bg-white">
                    <Accordion type="multiple" className="w-full">
                      {classes.items
                        .filter((clsItem) => {
                          if (!clsItem?.name || !clsItem?.classes?.length) return false
                          if (classSearchQuery) {
                            const query = classSearchQuery.toLowerCase()
                            return clsItem.name.toLowerCase().includes(query) ||
                              clsItem.classes.some((c) => c.arm?.toLowerCase().includes(query))
                          }
                          return true
                        })
                        .map((clsItem) => {
                          const streamSelected = isStreamSelected(clsItem.name)
                          const selectedCount = clsItem.classes.filter((cls) => 
                            selectedClassIds.includes(cls.id)
                          ).length
                          const totalCount = clsItem.classes.filter((cls) => cls?.id).length
                          
                          return (
                            <AccordionItem key={`accordion-${clsItem.name}`} value={clsItem.name} className="border-b last:border-b-0">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={streamSelected}
                                      onCheckedChange={(checked) => handleSelectStream(clsItem.name, checked as boolean)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="pointer-events-auto"
                                    />
                                    <span className="font-medium text-sm">{clsItem.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {selectedCount > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {selectedCount}/{totalCount}
                                      </Badge>
                                    )}
                                    <span>{totalCount} {totalCount === 1 ? "arm" : "arms"}</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                  {clsItem.classes
                                    .filter((cls) => {
                                      if (!cls?.id) return false
                                      if (classSearchQuery) {
                                        const query = classSearchQuery.toLowerCase()
                                        return cls.arm?.toLowerCase().includes(query)
                                      }
                                      return true
                                    })
                                    .map((cls) => {
                                      const isSelected = selectedClassIds.includes(cls.id)
                                      return (
                                        <label
                                          key={cls.id}
                                          className={`flex items-center gap-2 rounded-md border p-2.5 cursor-pointer transition-all ${
                                            isSelected
                                              ? "border-green-500 bg-green-50"
                                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                          }`}
                                        >
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => toggleClass(cls.id, checked as boolean)}
                                          />
                                          <span className="text-sm font-medium flex-1">
                                            {cls.arm || "Default"}
                                          </span>
                                          {isSelected && (
                                            <Badge variant="outline" className="text-xs bg-green-100 border-green-300">
                                              ✓
                                            </Badge>
                                          )}
                                        </label>
                                      )
                                    })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                    </Accordion>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {selectedClassIds.length === 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Unassigned Fee:</span> This fee will be created without any class assignments. You can assign it to specific classes or students later.
                  </p>
                </div>
              )}
              {isAllSelected && (
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <p className="text-xs text-green-700">
                    <span className="font-medium">School-wide Fee:</span> This fee will apply to all classes in the school.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600 text-center">
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
