"use client"

import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, CloudUpload, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useActiveFees, useCreatePayment, useFeeStudents } from "../_hooks/use-fees"
import { useAcademicSessions } from "../../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../../class-management/_hooks/use-academic-term"
import { PaymentSuccessModal } from "./payment-success-modal"
import { useMemo } from "react"
import { format } from "date-fns"

const formSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  invoice: z.string().optional(),
  feeComponent: z.string().min(1, "Fee component is required"),
  amountPaid: z.string().min(1, "Amount paid is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receipt: z.any().optional(),
})

interface PaymentSuccessData {
  studentName: string
  amountPaid: string
  feeComponent: string
  transactionId: string
  date: string
}

const AddPaymentForm = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<PaymentSuccessData | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      invoice: "",
      feeComponent: "",
      amountPaid: "",
      paymentMethod: "",
    },
  })

  const watchFeeComponent = watch("feeComponent")

  // Fetch active fees
  const { data: activeFeesData, isLoading: isActiveFeesLoading } = useActiveFees()
  const feeComponents = activeFeesData?.data?.data || []

  // Fetch students for selected fee
  const { data: studentsData, isLoading: isStudentsLoading } =
    useFeeStudents(watchFeeComponent)
  const students = studentsData?.data?.data || []

  // Reset student selection when fee component changes
  React.useEffect(() => {
    setValue("studentId", "")
  }, [watchFeeComponent, setValue])

  // Fetch sessions for ID resolution
  const { data: sessionsData } = useAcademicSessions({ limit: 100 })

  // Derive selected fee and session
  const selectedFee = feeComponents.find((f) => f.id === watchFeeComponent)

  // Resolve Session ID immediately to fetch relevant terms
  const resolvedSessionId = useMemo(() => {
    if (!selectedFee) return undefined
    if (selectedFee.session_id) return selectedFee.session_id
    if (selectedFee.session && sessionsData?.data) {
      const matched = sessionsData.data.find((s) => s.name === selectedFee.session)
      return matched?.id
    }
    return undefined
  }, [selectedFee, sessionsData])

  // Fetch terms for the specific session
  const { data: sessionTerms } = useAcademicTermsForSession(resolvedSessionId)

  // Create payment mutation
  const { mutate: createPayment, isPending: isSubmitting } = useCreatePayment()

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedStudent = students.find((s) => s.id === values.studentId)

    if (!selectedFee) {
      toast.error("Invalid fee component selected")
      return
    }

    if (!resolvedSessionId) {
      toast.error("Could not resolve Session ID for this fee")
      return
    }

    // Resolve Term ID from session terms
    let termId = selectedFee.term_id
    if (!termId && selectedFee.term && sessionTerms) {
      // Case-insensitive match
      const matchedTerm = sessionTerms.find(
        (t) => t.name.toLowerCase().trim() === selectedFee.term.toLowerCase().trim()
      )
      if (matchedTerm) termId = matchedTerm.id
    }

    if (!termId) {
      console.log("Failed to resolve Term ID. Fee Term:", selectedFee.term)
      console.log("Available Session Terms:", sessionTerms)
      toast.error("Could not resolve Term ID for this fee")
      return
    }

    // Construct FormData
    const formData = new FormData()
    formData.append("student_id", values.studentId)
    formData.append("fee_component_id", values.feeComponent)
    formData.append("amount_paid", values.amountPaid.replace(/[^0-9.]/g, ""))
    formData.append("payment_method", values.paymentMethod)
    formData.append("payment_date", new Date().toISOString())
    formData.append("session_id", resolvedSessionId)
    formData.append("term_id", termId)

    if (values.invoice) formData.append("invoice_number", values.invoice)
    if (file) formData.append("receipt_file", file)

    createPayment(formData, {
      onSuccess: () => {
        setSuccessData({
          studentName: selectedStudent?.name || "Unknown Student",
          amountPaid: values.amountPaid,
          feeComponent: selectedFee.name,
          transactionId: values.invoice || "N/A",
          date: format(new Date(), "dd MMM yyyy h:mm a"),
        })
        setShowSuccessModal(true)
      },
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setFile(droppedFile)
      setValue("receipt", droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setFile(selectedFile)
      setValue("receipt", selectedFile)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Fee Component - First because it drives Student selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Fee <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="feeComponent"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                    <SelectValue
                      placeholder={isActiveFeesLoading ? "Loading fees..." : "Select Fee"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isActiveFeesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      </div>
                    ) : feeComponents.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No fees found
                      </div>
                    ) : (
                      feeComponents.map((component) => (
                        <SelectItem key={component.id} value={component.id}>
                          {component.name} - {component.session} ({component.term})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.feeComponent && (
              <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
                <AlertCircleIcon className="h-4 w-4" /> {errors.feeComponent.message}
              </p>
            )}
          </div>

          {/* Student Name - Dependent on Fee Component */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Student Name <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="studentId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!watchFeeComponent}
                >
                  <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                    <SelectValue
                      placeholder={
                        isStudentsLoading ? "Loading students..." : "Select Student"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isStudentsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No students found
                      </div>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.studentId && (
              <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
                <AlertCircleIcon className="h-4 w-4" /> {errors.studentId.message}
              </p>
            )}
          </div>

          <FormField
            label="Invoice"
            placeholder="Add invoice number"
            required={false}
            className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
            {...register("invoice")}
            error={errors.invoice?.message}
          />

          <FormField
            label="Amount Paid"
            placeholder="₦0.00"
            required={true}
            className="font-outfit h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]"
            {...register("amountPaid")}
            error={errors.amountPaid?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Payment Method <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
                <AlertCircleIcon className="h-4 w-4" /> {errors.paymentMethod.message}
              </p>
            )}
          </div>
        </div>

        {/* File Upload */}
        {/* <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Receipt <span className="text-gray-500">(Optional)</span>
          </h3>

          <div
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/png,image/jpeg,application/pdf"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setValue("receipt", undefined)
                    }}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <CloudUpload className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, or PDF (MAX. 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </div> */}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-32"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-32 bg-[#DA3743] hover:bg-[#DA3743]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>

      <PaymentSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        onReset={() => {
          reset()
          setFile(null)
          setValue("receipt", undefined)
        }}
        data={successData}
      />
    </>
  )
}

export default AddPaymentForm
