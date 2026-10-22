"use client"

import React, { useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  X,
  CloudUpload,
  AlertCircleIcon,
  Check,
  ChevronsUpDown,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { useActiveFees, useCreatePayment, useFeeStudents } from "../_hooks/use-fees"
import { useAcademicSessions } from "../../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../../class-management/_hooks/use-academic-term"
import { PaymentSuccessModal } from "./payment-success-modal"
import { useMemo } from "react"
import { format } from "date-fns"

// Common Nigerian banks list
const NIGERIAN_BANKS = [
  "Access Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank (GTB)",
  "United Bank for Africa (UBA)",
  "Zenith Bank",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First City Monument Bank (FCMB)",
  "Union Bank of Nigeria",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Wema Bank",
  "Polaris Bank",
  "Providus Bank",
  "Jaiz Bank",
  "Heritage Bank",
  "Keystone Bank",
  "TajBank",
  "Other",
]

const formSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  invoice: z.string().optional(),
  feeComponent: z.string().min(1, "Select a fee"),
  amountPaid: z.string().min(1, "Amount paid is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  bankName: z.string().optional(),
  description: z.string().optional(),
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
  const [studentPickerOpen, setStudentPickerOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [successData, setSuccessData] = useState<PaymentSuccessData | null>(null)

  const {
    register,
    handleSubmit,
    control,
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
      bankName: "",
      description: "",
    },
  })

  const watchFeeComponent = useWatch({ control, name: "feeComponent" })
  const watchPaymentMethod = useWatch({ control, name: "paymentMethod" })

  // Fetch active fees
  const { data: activeFeesData, isLoading: isActiveFeesLoading } = useActiveFees()
  const feeComponents = useMemo(() => {
    const rawFees = activeFeesData?.data?.data || []
    return rawFees.filter(
      (f): f is NonNullable<typeof f> =>
        f != null &&
        typeof f === "object" &&
        "id" in f &&
        f.id != null &&
        "name" in f &&
        f.name != null
    )
  }, [activeFeesData?.data?.data])

  // Fetch students for selected fee
  const { data: studentsData, isLoading: isStudentsLoading } =
    useFeeStudents(watchFeeComponent)
  const students = useMemo(() => {
    const rawStudents = studentsData?.data?.data || []
    return rawStudents
      .filter(
        (s): s is NonNullable<typeof s> =>
          s != null &&
          typeof s === "object" &&
          "id" in s &&
          s.id != null &&
          "name" in s &&
          s.name != null
      )
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name, undefined, { sensitivity: "base" }) ||
          left.registration_number.localeCompare(right.registration_number)
      )
  }, [studentsData?.data?.data])
  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLocaleLowerCase()
    return query
      ? students.filter((student) =>
          `${student.name} ${student.registration_number}`
            .toLocaleLowerCase()
            .includes(query)
        )
      : students
  }, [students, studentSearch])

  // A student selected for one fee may not be assigned to another fee.
  React.useEffect(() => {
    setValue("studentId", "")
  }, [watchFeeComponent, setValue])

  // Fetch sessions for ID resolution
  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  const activeSession = sessionsData?.data?.find((s) => s.isActive)

  // Derive selected fee and session
  const selectedFee = feeComponents.find((f) => f && f.id === watchFeeComponent) || null

  // Resolve Session ID immediately to fetch relevant terms
  const resolvedSessionId = useMemo(() => {
    if (!selectedFee) return activeSession?.id
    if (selectedFee.session_id) return selectedFee.session_id
    if (selectedFee.session && sessionsData?.data) {
      const matched = sessionsData.data.find((s) => s.name === selectedFee.session)
      return matched?.id
    }
    return activeSession?.id
  }, [selectedFee, sessionsData, activeSession])

  // Fetch terms for the specific session
  const { data: sessionTerms } = useAcademicTermsForSession(resolvedSessionId)

  // Create payment mutation
  const { mutate: createPayment, isPending: isSubmitting } = useCreatePayment()

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedStudent = students.find((s) => s.id === values.studentId)
    if (!selectedStudent) {
      toast.error("Select a student assigned to this fee")
      return
    }

    if (!resolvedSessionId) {
      toast.error("Could not resolve Session ID. Please ensure an active session exists.")
      return
    }

    // A session fee is recorded against the current term in its session.
    let termId: string | undefined = undefined
    if (values.feeComponent && selectedFee) {
      termId = selectedFee.term_id || undefined
      if (selectedFee.period_type === "SESSION") {
        termId = sessionTerms?.find((term) => term.isActive)?.id
      }
      if (!termId && selectedFee.term && sessionTerms) {
        const matchedTerm = sessionTerms.find(
          (t) => t.name.toLowerCase().trim() === selectedFee.term.toLowerCase().trim()
        )
        if (matchedTerm) termId = matchedTerm.id
      }

      if (!termId) {
        toast.error("Could not find an active term for this fee's session")
        return
      }
    }

    // Construct FormData
    const formData = new FormData()

    formData.append("student_id", values.studentId)
    formData.append("fee_component_id", values.feeComponent)

    formData.append("amount_paid", values.amountPaid.replace(/[^0-9.]/g, ""))
    formData.append("payment_method", values.paymentMethod)
    formData.append("payment_date", new Date().toISOString())
    formData.append("session_id", resolvedSessionId)

    if (termId) {
      formData.append("term_id", termId)
    }

    if (values.invoice) formData.append("invoice_number", values.invoice)
    if (values.bankName && values.paymentMethod === "bank_transfer") {
      formData.append("bank_name", values.bankName)
    }
    if (values.description) {
      formData.append("description", values.description)
    }
    if (file) formData.append("receipt_file", file)

    createPayment(formData, {
      onSuccess: (response) => {
        // The API returns { status_code, message, response: PaymentResponseDto }
        // but the type says ResponsePack<null>, so we need to handle both cases
        const responseData = response as unknown as {
          response?: { transaction_id?: string }
          data?: { transaction_id?: string }
        }
        const transactionId =
          responseData?.response?.transaction_id ||
          responseData?.data?.transaction_id ||
          values.invoice ||
          "N/A"

        setSuccessData({
          studentName: selectedStudent?.name || "Unassigned",
          amountPaid: values.amountPaid,
          feeComponent: selectedFee?.name || "Unassigned",
          transactionId,
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
          {/* Fee component */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Fee <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Controller
                control={control}
                name="feeComponent"
                render={({ field }) => (
                  <>
                    <Select
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] pr-10 placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                        <SelectValue
                          placeholder={
                            isActiveFeesLoading ? "Loading fees..." : "Select fee"
                          }
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
                        ) : feeComponents.length === 0 ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            No fees available
                          </div>
                        ) : (
                          feeComponents.map((component) => (
                            <SelectItem key={component.id} value={component.id}>
                              {component.name} - {component.session || ""} (
                              {component.term || ""})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Clear fee selection"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              />
            </div>
            {errors.feeComponent && (
              <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
                <AlertCircleIcon className="h-4 w-4" /> {errors.feeComponent.message}
              </p>
            )}
          </div>

          {/* Search students assigned to the selected fee */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Student Name <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Controller
                control={control}
                name="studentId"
                render={({ field }) => (
                  <>
                    <Popover
                      open={studentPickerOpen}
                      onOpenChange={(open) => {
                        setStudentPickerOpen(open)
                        if (!open) setStudentSearch("")
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={studentPickerOpen}
                          disabled={!watchFeeComponent || isStudentsLoading}
                          className="font-outfit h-13! w-full justify-between rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] font-normal shadow-sm"
                        >
                          <span className="truncate">
                            {isStudentsLoading
                              ? "Loading students..."
                              : students.find((student) => student.id === field.value)
                                  ?.name ||
                                (watchFeeComponent
                                  ? "Search student name or ID"
                                  : "Select a fee first")}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search name or student ID..."
                            value={studentSearch}
                            onValueChange={setStudentSearch}
                          />
                          <CommandList>
                            {filteredStudents.length === 0 && (
                              <div className="px-3 py-6 text-center text-sm text-gray-500">
                                No student assigned to this fee matches your search.
                              </div>
                            )}
                            <CommandGroup>
                              {filteredStudents.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={`${student.name} ${student.registration_number}`}
                                  onSelect={() => {
                                    field.onChange(student.id)
                                    setStudentPickerOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${field.value === student.id ? "opacity-100" : "opacity-0"}`}
                                  />
                                  <span>{student.name}</span>
                                  <span className="ml-auto text-xs text-gray-500">
                                    {student.registration_number}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Clear student selection"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              />
            </div>
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
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
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

          {/* Bank Name - Show only when payment method is bank_transfer */}
          {watchPaymentMethod === "bank_transfer" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Bank Name <span className="text-xs text-gray-500">(Recommended)</span>
              </label>
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Description/Notes <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <Textarea
            {...register("description")}
            placeholder="Add any notes or description about this payment..."
            className="font-outfit min-h-[100px] w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
            rows={4}
          />
          {errors.description && (
            <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
              <AlertCircleIcon className="h-4 w-4" /> {errors.description.message}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-4">
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
        </div>

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
