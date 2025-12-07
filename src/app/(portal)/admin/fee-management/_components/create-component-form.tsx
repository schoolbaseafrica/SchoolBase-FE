"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
const feeComponentSchema = z.object({
  component_name: z.string().min(2, "Component name is required"),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  session_id: z.string().uuid("Select a session"),
  term_id: z.string().uuid("Select a term"),
  class_ids: z.array(z.string().uuid()).min(1, "Select at least one class"),
})

type FeeComponentFormValues = z.infer<typeof feeComponentSchema>

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

  const form = useForm<FeeComponentFormValues>({
    resolver: zodResolver(feeComponentSchema),
    defaultValues: {
      component_name: "",
      description: "",
      amount: "",
      session_id: "",
      term_id: "",
      class_ids: [],
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = form
  const createComponent = useCreateFeeComponent()

  // Sync selectedClassIds with RHF
  useEffect(() => {
    setValue("class_ids", selectedClassIds)
  }, [selectedClassIds, setValue])

  // Reset term when session changes
  useEffect(() => {
    if (selectedSession) {
      setValue("term_id", "")
    }
  }, [selectedSession, setValue])

  const handleCancel = () => {
    reset()
    setSelectedClassIds([])
    setSelectedSession("")
    onSuccess?.() // Close the drawer
  }

  const onSubmit = async (values: FeeComponentFormValues) => {
    // console.log("Submitting values:", values)
    // try {
    await createComponent.mutateAsync({
      component_name: values.component_name,
      description: values.description ?? "",
      amount: Number(values.amount),
      term_id: values.term_id,
      class_ids: values.class_ids,
    })
    reset()
    setSelectedClassIds([])
    setSelectedSession("")
    // toast.success("Fee component created successfully")
    onSuccess?.() // Close the drawer after success
    setModalOpen(true) // Show success modal
    // } catch (error) {
    //   toast.error("Failed to create fee component")
    // }
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

        {/* Session */}
        <div className="space-y-1">
          <Label>Academic Session</Label>
          {loadingSessions ? (
            <p className="text-sm text-gray-500">Loading sessions...</p>
          ) : sessions?.data?.length ? (
            <Select
              value={selectedSession}
              onValueChange={(value) => {
                setSelectedSession(value)
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

        {/* Term */}
        <div className="space-y-1">
          <Label>Term</Label>
          {!selectedSession ? (
            <p className="text-sm text-gray-500">Please select a session first</p>
          ) : loadingTerms ? (
            <p className="text-sm text-gray-500">Loading terms...</p>
          ) : termsError ? (
            <p className="text-sm text-red-500">Error loading terms</p>
          ) : terms && terms.length > 0 ? (
            <Select
              value={watch("term_id")}
              onValueChange={(value) => setValue("term_id", value)}
            >
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

        {/* Classes */}
        <div className="space-y-1">
          <Label>Classes</Label>
          {loadingClasses ? (
            <p className="text-sm text-gray-500">Loading classes...</p>
          ) : classes?.items?.length ? (
            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
              {classes.items.map((clsItem) =>
                clsItem.classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cls.id}
                      checked={selectedClassIds.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    />
                    <label
                      htmlFor={cls.id}
                      className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {clsItem.name} {cls.arm}
                    </label>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No classes available</p>
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
