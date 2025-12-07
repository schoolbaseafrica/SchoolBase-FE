"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useMemo, useState } from "react"
import { Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// === Zod schema ===
const formSchema = z.object({
  feeName: z.string().min(1, "Fee name is required"),
  termSession: z.string().min(1, "Term/Session is required"),
  class: z.string().min(1, "Class is required"),
  amount: z
    .string()
    .regex(/^\d+$/, "Amount must be a number")
    .min(1, "Amount is required"),
  status: z.boolean(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function AddNewFeeForm() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feeName: "Tuition",
      termSession: "2024/2025",
      class: "JSSB2",
      amount: "175000",
      status: true,
      description: "",
    },
  })

  // === Watch entire form safely ===
  const watchedFields = useWatch({
    control,
    defaultValue: {
      feeName: "Tuition",
      termSession: "2024/2025",
      class: "JSSB2",
      amount: "175000",
      status: true,
      description: "",
    },
  }) as FormData

  // === Memoized summary ===
  const summary = useMemo(
    () => ({
      feeName: watchedFields.feeName,
      termName: watchedFields.termSession,
      className: watchedFields.class,
      amount: watchedFields.amount,
      status: watchedFields.status,
      description: watchedFields.description ?? "",
    }),
    [watchedFields]
  )

  const onSubmit = async (data: FormData) => {
    console.log("Fee created successfully:", data)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSuccessModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FORM */}
        <div className="rounded-2xl border-0 bg-white p-5 shadow-lg lg:col-span-2">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Fee Name */}
            <div className="space-y-2">
              <Label className="mb-5 text-[19px]">Fee Name</Label>
              <Select
                value={watchedFields.feeName}
                onValueChange={(v: string) => setValue("feeName", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tuition">Tuition</SelectItem>
                  <SelectItem value="Boarding">Boarding</SelectItem>
                  <SelectItem value="PTA Levy">PTA Levy</SelectItem>
                  <SelectItem value="Uniform">Uniform</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Term & Class */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term/Session</Label>
                <Select
                  value={watchedFields.termSession}
                  onValueChange={(v: string) => setValue("termSession", v)}
                >
                  <SelectTrigger className="w-[150px] md:w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={watchedFields.class}
                  onValueChange={(v: string) => setValue("class", v)}
                >
                  <SelectTrigger className="w-[150px] md:w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSSB2">JSSB2</SelectItem>
                    <SelectItem value="SSS1">SSS1</SelectItem>
                    <SelectItem value="SSS3">SSS3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                placeholder=""
                {...register("amount")}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="gap-4">
              <Label htmlFor="status">Status</Label>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground text-sm">
                  Set the fee group as active or inactive
                </span>
                <Switch
                  checked={watchedFields.status}
                  onCheckedChange={(checked: boolean) => setValue("status", checked)}
                  className="size-11 h-7 w-12 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Add a short description for this fee group..."
                rows={4}
                {...register("description")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-8">
              <Button type="button" variant="outline" className="px-8 text-[16px]">
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 text-[16px] hover:bg-red-700">
                <Save className="h-10 w-10" />
                Save
              </Button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Name</span>
                <span className="font-medium">{summary.feeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium">{summary.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicable Term</span>
                <span className="font-medium">{summary.termName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ₦{Number(summary.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={summary.status ? "bg-green-100" : "bg-red-200 text-red-600"}
                >
                  {summary.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="text-muted-foreground max-w-[150px] text-right">
                  {summary.description || "Not provided"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/10 backdrop-blur-sm" />
      )}

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="z-160 sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="rounded-full bg-green-100 p-5">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold">
                Fee Added Successfully! 🎉
              </DialogTitle>
              <DialogDescription className="max-w-sm text-center text-base text-gray-600">
                The new fee{" "}
                <span className="font-semibold text-gray-900">{summary.feeName}</span> has
                been created and is now {summary.status ? "active" : "inactive"}.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-red-600 px-8 hover:bg-red-500"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"

// import { useForm, useWatch } from "react-hook-form"
// import { z } from "zod"
// import { useMemo, useState } from "react"
// import { Save, CheckCircle2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Switch } from "@/components/ui/switch"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// // === Zod schema ===
// const formSchema = z.object({
//   feeName: z.string().min(1, "Fee name is required"),
//   termSession: z.string().min(1, "Term/Session is required"),
//   class: z.string().min(1, "Class is required"),
//   amount: z
//     .string()
//     .regex(/^\d+$/, "Amount must be a number")
//     .min(1, "Amount is required"),
//   status: z.boolean(),
//   description: z.string().optional(),
// })

// type FormData = z.infer<typeof formSchema>

// // Helper type for watching multiple fields
// type WatchFields = Pick<
//   FormData,
//   "feeName" | "termSession" | "class" | "amount" | "status" | "description"
// >

// export function AddNewFeeForm() {
//   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       feeName: "Tuition",
//       termSession: "2024/2025",
//       class: "JSSB2",
//       amount: "175000",
//       status: true,
//       description: "",
//     },
//   })

//   // === Watch fields ===
//   const watchedFields: WatchFields = useWatch({
//     control,
//     name: ["feeName", "termSession", "class", "amount", "status", "description"],
//   }) as WatchFields // Type assertion safe because we know the keys

//   // === Summary memo ===
//   const summary = useMemo(
//     () => ({
//       feeName: watchedFields.feeName,
//       termName: watchedFields.termSession,
//       className: watchedFields.class,
//       amount: watchedFields.amount,
//       status: watchedFields.status,
//       description: watchedFields.description ?? "",
//     }),
//     [watchedFields]
//   )

//   const onSubmit = async (data: FormData) => {
//     console.log("Fee created successfully:", data)
//     await new Promise((resolve) => setTimeout(resolve, 800))
//     setIsSuccessModalOpen(true)
//   }

//   return (
//     <>
//       <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//         {/* ====== FORM ====== */}
//         <div className="rounded-2xl border-0 bg-white p-5 shadow-lg lg:col-span-2">
//           <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
//             {/* Fee Name */}
//             <div className="space-y-2">
//               <Label className="mb-5 text-[19px]">Fee Name</Label>
//               <Select
//                 value={watchedFields.feeName}
//                 onValueChange={(v: string) => setValue("feeName", v)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select fee type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Tuition">Tuition</SelectItem>
//                   <SelectItem value="Boarding">Boarding</SelectItem>
//                   <SelectItem value="PTA Levy">PTA Levy</SelectItem>
//                   <SelectItem value="Uniform">Uniform</SelectItem>
//                   <SelectItem value="Books">Books</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Term & Class */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Term/Session</Label>
//                 <Select
//                   value={watchedFields.termSession}
//                   onValueChange={(v: string) => setValue("termSession", v)}
//                 >
//                   <SelectTrigger className="w-[150px] md:w-60">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="2024/2025">2024/2025</SelectItem>
//                     <SelectItem value="2025/2026">2025/2026</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Class</Label>
//                 <Select
//                   value={watchedFields.class}
//                   onValueChange={(v: string) => setValue("class", v)}
//                 >
//                   <SelectTrigger className="w-[150px] md:w-60">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="JSSB2">JSSB2</SelectItem>
//                     <SelectItem value="SSS1">SSS1</SelectItem>
//                     <SelectItem value="SSS3">SSS3</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Amount */}
//             <div className="space-y-2">
//               <Label>Amount</Label>
//               <Input
//                 placeholder=""
//                 {...register("amount")}
//                 className={errors.amount ? "border-red-500" : ""}
//               />
//               {errors.amount && (
//                 <p className="text-sm text-red-500">{errors.amount.message}</p>
//               )}
//             </div>

//             {/* Status */}
//             <div className="gap-4">
//               <Label htmlFor="status">Status</Label>

//               <div className="flex justify-between pt-2">
//                 <span className="text-muted-foreground text-sm">
//                   Set the fee group as active or inactive
//                 </span>

//                 <Switch
//                   checked={watchedFields.status}
//                   onCheckedChange={(checked: boolean) => setValue("status", checked)}
//                   className="size-11 h-7 w-12 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <Label>Description (Optional)</Label>
//               <Textarea
//                 placeholder="Add a short description for this fee group..."
//                 rows={4}
//                 {...register("description")}
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-8">
//               <Button type="button" variant="outline" className="px-8 text-[16px]">
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-red-600 text-[16px] hover:bg-red-700">
//                 <Save className="h-10 w-10" />
//                 Save
//               </Button>
//             </div>
//           </form>
//         </div>

//         {/* Summary Card */}
//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Fee Name</span>
//                 <span className="font-medium">{summary.feeName}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Class</span>
//                 <span className="font-medium">{summary.className}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Applicable Term</span>
//                 <span className="font-medium">{summary.termName}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Amount</span>
//                 <span className="font-medium">
//                   ₦{Number(summary.amount || 0).toLocaleString()}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Status</span>
//                 <Badge
//                   className={summary.status ? "bg-green-100" : "bg-red-200 text-red-600"}
//                 >
//                   {summary.status ? "Active" : "Inactive"}
//                 </Badge>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Description</span>
//                 <span className="text-muted-foreground max-w-[150px] text-right">
//                   {summary.description || "Not provided"}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {isSuccessModalOpen && (
//         <div className="fixed inset-0 z-100 bg-black/10 backdrop-blur-sm" />
//       )}

//       <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
//         <DialogContent className="z-160 sm:max-w-md">
//           <DialogHeader>
//             <div className="flex flex-col items-center justify-center space-y-6 py-8">
//               <div className="rounded-full bg-green-100 p-5">
//                 <CheckCircle2 className="h-16 w-16 text-green-600" />
//               </div>
//               <DialogTitle className="text-center text-2xl font-bold">
//                 Fee Added Successfully! 🎉
//               </DialogTitle>
//               <DialogDescription className="max-w-sm text-center text-base text-gray-600">
//                 The new fee{" "}
//                 <span className="font-semibold text-gray-900">{summary.feeName}</span> has
//                 been created and is now {summary.status ? "active" : "inactive"}.
//               </DialogDescription>
//             </div>
//           </DialogHeader>

//           <div className="flex justify-center pt-4">
//             <Button
//               onClick={() => setIsSuccessModalOpen(false)}
//               className="bg-red-600 px-8 hover:bg-red-500"
//             >
//               Got it!
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// // "use client"

// // import { zodResolver } from "@hookform/resolvers/zod"
// // import { useForm, useWatch } from "react-hook-form"
// // import { z } from "zod"
// // import { useMemo, useState } from "react"
// // import { Save, CheckCircle2 } from "lucide-react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Textarea } from "@/components/ui/textarea"
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog"
// // import { Switch } from "@/components/ui/switch"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"

// // // === Zod schema ===
// // const formSchema = z.object({
// //   feeName: z.string().min(1, "Fee name is required"),
// //   termSession: z.string().min(1, "Term/Session is required"),
// //   class: z.string().min(1, "Class is required"),
// //   amount: z
// //     .string()
// //     .regex(/^\d+$/, "Amount must be a number")
// //     .min(1, "Amount is required"),
// //   status: z.boolean(),
// //   description: z.string().optional(),
// // })

// // type FormData = z.infer<typeof formSchema>

// // export function AddNewFeeForm() {
// //   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

// //   const {
// //     register,
// //     handleSubmit,
// //     setValue,
// //     control,
// //     formState: { errors },
// //   } = useForm<FormData>({
// //     resolver: zodResolver(formSchema),
// //     defaultValues: {
// //       feeName: "Tuition",
// //       termSession: "2024/2025",
// //       class: "JSSB2",
// //       amount: "175000",
// //       status: true,
// //       description: "",
// //     },
// //   })

// //   // === Watch fields ===
// //   const [feeName, termSession, classValue, amount, status, description] = useWatch({
// //     control,
// //     name: ["feeName", "termSession", "class", "amount", "status", "description"],
// //   })

// //   const summary = useMemo(
// //     () => ({
// //       feeName: feeName ?? "",
// //       termSession: termSession ?? "",
// //       class: classValue ?? "",
// //       amount: amount ?? "",
// //       status: Boolean(status),
// //       description: description ?? "",
// //       className: classValue ?? "",
// //       termName: termSession ?? "",
// //     }),
// //     [feeName, termSession, classValue, amount, status, description]
// //   )

// //   const onSubmit = async (data: FormData) => {
// //     console.log("Fee created successfully:", data)
// //     await new Promise((resolve) => setTimeout(resolve, 800))
// //     setIsSuccessModalOpen(true)
// //   }

// //   return (
// //     <>
// //       <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
// //         {/* ====== FORM ====== */}
// //         <div className="rounded-2xl border-0 bg-white p-5 shadow-lg lg:col-span-2">
// //           <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
// //             {/* Fee Name */}
// //             <div className="space-y-2">
// //               <Label className="mb-5 text-[19px]">Fee Name</Label>
// //               <Select
// //                 defaultValue="Tuition"
// //                 onValueChange={(v) => setValue("feeName", v)}
// //               >
// //                 <SelectTrigger className="w-full">
// //                   <SelectValue placeholder="Select fee type" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="Tuition">Tuition</SelectItem>
// //                   <SelectItem value="Boarding">Boarding</SelectItem>
// //                   <SelectItem value="PTA Levy">PTA Levy</SelectItem>
// //                   <SelectItem value="Uniform">Uniform</SelectItem>
// //                   <SelectItem value="Books">Books</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div>

// //             {/* Term & Class */}
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label>Term/Session</Label>
// //                 <Select
// //                   defaultValue="2024/2025"
// //                   onValueChange={(v) => setValue("termSession", v)}
// //                 >
// //                   <SelectTrigger className="w-[150px] md:w-[240px]">
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="2024/2025">2024/2025</SelectItem>
// //                     <SelectItem value="2025/2026">2025/2026</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label>Class</Label>
// //                 <Select defaultValue="JSSB2" onValueChange={(v) => setValue("class", v)}>
// //                   <SelectTrigger className="w-[150px] md:w-[240px]">
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="JSSB2">JSSB2</SelectItem>
// //                     <SelectItem value="SSS1">SSS1</SelectItem>
// //                     <SelectItem value="SSS3">SSS3</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //             </div>

// //             {/* Amount */}
// //             <div className="space-y-2">
// //               <Label>Amount</Label>
// //               <Input
// //                 placeholder=""
// //                 {...register("amount")}
// //                 className={errors.amount ? "border-red-500" : ""}
// //               />
// //               {errors.amount && (
// //                 <p className="text-sm text-red-500">{errors.amount.message}</p>
// //               )}
// //             </div>

// //             {/* Status */}
// //             <div className="gap-4">
// //               <Label htmlFor="status">Status</Label>

// //               <div className="flex justify-between pt-2">
// //                 <span className="text-muted-foreground text-sm">
// //                   Set the fee group as active or inactive
// //                 </span>

// //                 <Switch
// //                   checked={status}
// //                   onCheckedChange={(checked) => setValue("status", checked)}
// //                   className="size-11 h-7 w-12 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
// //                 />
// //               </div>
// //             </div>

// //             {/* Description */}
// //             <div className="space-y-2">
// //               <Label>Description (Optional)</Label>
// //               <Textarea
// //                 placeholder="Add a short description for this fee group..."
// //                 rows={4}
// //                 {...register("description")}
// //               />
// //             </div>

// //             {/* Buttons */}
// //             <div className="flex gap-4 pt-8">
// //               <Button type="button" variant="outline" className="px-8 text-[16px]">
// //                 Cancel
// //               </Button>
// //               <Button type="submit" className="bg-red-600 text-[16px] hover:bg-red-700">
// //                 <Save className="h-10 w-10" />
// //                 Save
// //               </Button>
// //             </div>
// //           </form>
// //         </div>

// //         <div>
// //           <Card>
// //             <CardHeader>
// //               <CardTitle className="text-lg">Summary</CardTitle>
// //             </CardHeader>
// //             <CardContent className="space-y-4 text-sm">
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Fee Name</span>
// //                 <span className="font-medium">{summary.feeName || "-"}</span>
// //               </div>

// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Class</span>
// //                 <span className="font-medium">{summary.className || "-"}</span>
// //               </div>

// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Applicable Term</span>
// //                 <span className="font-medium">{summary.termName || "-"}</span>
// //               </div>

// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Amount</span>
// //                 <span className="font-medium">
// //                   ₦{Number(summary.amount || 0).toLocaleString()}
// //                 </span>
// //               </div>

// //               <div className="flex items-center justify-between">
// //                 <span className="text-muted-foreground">Status</span>
// //                 <Badge
// //                   className={summary.status ? "bg-green-100" : "bg-red-200 text-red-600"}
// //                 >
// //                   {summary.status ? "* Active" : "Inactive"}
// //                 </Badge>
// //               </div>

// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Description</span>
// //                 <span className="text-muted-foreground max-w-[150px] text-right">
// //                   {summary.description || "Not provided"}
// //                 </span>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </div>
// //       </div>

// //       {/*  GLOBAL OVERLAY TO BLOCK SIDEBAR */}

// //       {isSuccessModalOpen && (
// //         <div className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm" />
// //       )}

// //       <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
// //         <DialogContent className="z-[160] sm:max-w-md">
// //           <DialogHeader>
// //             <div className="flex flex-col items-center justify-center space-y-6 py-8">
// //               <div className="rounded-full bg-green-100 p-5">
// //                 <CheckCircle2 className="h-16 w-16 text-green-600" />
// //               </div>
// //               <DialogTitle className="text-center text-2xl font-bold">
// //                 Fee Added Successfully! 🎉
// //               </DialogTitle>
// //               <DialogDescription className="max-w-sm text-center text-base text-gray-600">
// //                 The new fee{" "}
// //                 <span className="font-semibold text-gray-900">{summary.feeName}</span> has
// //                 been created and is now {summary.status ? "active" : "inactive"}.
// //               </DialogDescription>
// //             </div>
// //           </DialogHeader>

// //           <div className="flex justify-center pt-4">
// //             <Button
// //               onClick={() => setIsSuccessModalOpen(false)}
// //               className="bg-red-600 px-8 hover:bg-red-500"
// //             >
// //               Got it!
// //             </Button>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //     </>
// //   )
// // }
