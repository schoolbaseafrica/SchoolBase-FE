"use client"

import { useParams, useRouter } from "next/navigation"
import { UpdateStudentData } from "@/lib/students"
import {
  NewPersonFormBuilder,
  FormField,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import {
  ArrowLeftIcon,
  AlertCircle,
  Users,
  CreditCard,
  X,
  QrCode,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useGetStudent, useUpdateStudent } from "../_hooks/use-students"
import { StudentsAPI } from "@/lib/students"
import { baseStudentFormConfig } from "../new/components/new-student-form"
import { ItemLoader } from "../../_components/sub-loader"
import AssignClassDialog from "../_components/assign-class-dialog"
import { useGetClass } from "../../class-management/_hooks/use-classes"

export default function EditStudentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [showAssignClassDialog, setShowAssignClassDialog] = useState(false)
  const [nfcCardId, setNfcCardId] = useState<string>("")
  const [isUpdatingNfc, setIsUpdatingNfc] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const {
    data: student,
    isLoading,
    isError,
    error,
    refetch: refetchStudent,
  } = useGetStudent(id as string)
  const updateStudentMutation = useUpdateStudent(id as string)

  // Fetch current class details if student has a class assigned
  const { data: currentClass } = useGetClass(student?.current_class_id || "", {
    enabled: !!student?.current_class_id,
  })

  // Sync NFC card ID with student data
  useEffect(() => {
    if (student?.nfc_card_id !== undefined) {
      setNfcCardId(student.nfc_card_id || "")
      setQrCodeDataUrl(null) // Reset QR code when card ID changes
    }
  }, [student?.nfc_card_id])

  const handleGenerateQrCode = async () => {
    const cardId = student?.nfc_card_id || nfcCardId
    if (!cardId) {
      toast.error("No NFC card ID assigned")
      return
    }

    setIsGeneratingQr(true)
    try {
      const response = await StudentsAPI.generateNfcQrCode(cardId)
      setQrCodeDataUrl(response.data.qr_code_data_url)
      toast.success("QR code generated")
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate QR code")
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `nfc-card-${student?.nfc_card_id || "card"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function handleGenerateNfcCard() {
    if (!id) return

    setIsUpdatingNfc(true)
    try {
      const updateData: UpdateStudentData = {
        auto_generate_nfc_id: true,
      } as any
      await updateStudentMutation.mutateAsync(updateData)
      toast.success("Secure NFC card ID generated successfully")
      refetchStudent()
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate NFC card ID")
    } finally {
      setIsUpdatingNfc(false)
    }
  }

  async function handleUpdateNfcCard() {
    if (!id) return

    if (!nfcCardId.trim()) {
      toast.error("Please enter an NFC card ID")
      return
    }

    setIsUpdatingNfc(true)
    try {
      const updateData: UpdateStudentData = {
        nfc_card_id: nfcCardId.trim() || null,
      }
      await updateStudentMutation.mutateAsync(updateData)
      toast.success("NFC card ID updated successfully")
      refetchStudent()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update NFC card ID")
    } finally {
      setIsUpdatingNfc(false)
    }
  }

  async function handleRemoveNfcCard() {
    if (!id) return

    setIsUpdatingNfc(true)
    try {
      const updateData: UpdateStudentData = {
        nfc_card_id: null,
      }
      await updateStudentMutation.mutateAsync(updateData)
      toast.success("NFC card ID removed successfully")
      setNfcCardId("")
      refetchStudent()
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove NFC card ID")
    } finally {
      setIsUpdatingNfc(false)
    }
  }

  async function handleCancel() {
    router.push("/admin/students")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!id) return

    try {
      const updateData: UpdateStudentData = {
        first_name: formData.first_name as string,
        last_name: formData.last_name as string,
        middle_name: formData.middle_name as string,
        gender: formData.gender as string,
        phone: formData.phone as string,
        date_of_birth: formData.date_of_birth as string,
        home_address: formData.home_address as string,
        nfc_card_id: formData.nfc_card_id as string | null | undefined,
      }

      await updateStudentMutation.mutateAsync(updateData)
      setTimeout(() => {
        router.push("/admin/students")
      }, 300)
    } catch (err) {
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <ItemLoader item="student details" />
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {error?.message || "Student Not Found"}
            </h2>
            <p className="mb-6 text-gray-600">
              {error?.message || "The student you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/admin/students">Back to Students</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Create edit form fields
  const editStudentFormFields: FormField[] = [
    // Add registration number field at the top for edit mode
    {
      name: "registration_number",
      label: "Registration Number",
      type: "text",
      placeholder: "Auto-generated",
      required: false,
      disabled: true,
      readonly: true,
    },
    // Map through original fields and modify password field
    ...baseStudentFormConfig.fields.map((field) => {
      if (field.name === "password") {
        return {
          ...field,
          disabled: true,
          readonly: true,
          placeholder: "Password cannot be changed here",
          required: false,
        }
      }
      if (field.name === "email") {
        return {
          ...field,
          disabled: true,
          readonly: true,
        }
      }
      return field
    }),
  ]

  const editStudentFormConfig = {
    ...baseStudentFormConfig,
    fields: editStudentFormFields,
    submitText: "Update",
  }

  const initialData = {
    registration_number:
      student.registration_number || student.reg_number || "Not assigned",
    first_name: student.first_name,
    last_name: student.last_name,
    middle_name: student.middle_name || "",
    email: student.email,
    gender: student.gender,
    phone: student.phone,
    date_of_birth: student.date_of_birth,
    home_address: student.home_address,
    password: "********", // Show placeholder for password
  }

  const studentName = student
    ? `${student.first_name} ${student.last_name}`.trim()
    : "Student"

  return (
    <>
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <div>
          <div className="mb-4 md:mb-0 md:hidden">
            <Button
              asChild
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200"
              size="icon"
            >
              <Link href="/admin/students">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600">Update student details.</p>
        </div>

        {/* Class Assignment Section */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Class Assignment</h3>
                <p className="text-sm text-gray-600">
                  {currentClass
                    ? `Currently assigned to: ${currentClass.name}${currentClass.arm ? ` ${currentClass.arm}` : ""}`
                    : student?.current_class_id
                      ? "Loading class information..."
                      : "Not assigned to any class"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAssignClassDialog(true)}
              variant="outline"
              className="shrink-0"
            >
              {currentClass || student?.current_class_id
                ? "Change Class"
                : "Assign to Class"}
            </Button>
          </div>
        </div>

        {/* NFC Card Assignment Section */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">NFC Card ID</h3>
                <p className="text-sm text-gray-600">
                  Assign an NFC card ID for attendance tracking via card scanning
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter NFC card ID or click Generate"
                value={nfcCardId}
                onChange={(e) => setNfcCardId(e.target.value)}
                className="flex-1"
                disabled={isUpdatingNfc}
              />
              <Button
                onClick={handleGenerateNfcCard}
                variant="outline"
                disabled={isUpdatingNfc}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
              <Button
                onClick={handleUpdateNfcCard}
                variant="outline"
                disabled={
                  isUpdatingNfc ||
                  !nfcCardId.trim() ||
                  nfcCardId === (student?.nfc_card_id || "")
                }
              >
                {isUpdatingNfc ? "Saving..." : student?.nfc_card_id ? "Update" : "Assign"}
              </Button>
              {student?.nfc_card_id && (
                <Button
                  onClick={handleRemoveNfcCard}
                  variant="outline"
                  disabled={isUpdatingNfc}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            {student?.nfc_card_id && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Current card ID:{" "}
                  <span className="font-mono font-semibold">{student.nfc_card_id}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerateQrCode}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingQr}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {isGeneratingQr ? "Generating..." : "Generate QR Code"}
                  </Button>
                  {qrCodeDataUrl && (
                    <>
                      <Button onClick={handleDownloadQrCode} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                      </Button>
                      <div className="rounded-lg border border-gray-200 bg-white p-2">
                        <img
                          src={qrCodeDataUrl}
                          alt="NFC Card QR Code"
                          className="h-32 w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <NewPersonFormBuilder
            config={editStudentFormConfig}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={initialData}
            isEditMode={true}
          />
        </div>
      </div>

      {/* Assign Class Dialog */}
      {student && (
        <AssignClassDialog
          open={showAssignClassDialog}
          setOpen={setShowAssignClassDialog}
          studentId={student.id}
          studentName={studentName}
          currentClassId={student.current_class_id || undefined}
          onSuccess={() => {
            refetchStudent()
          }}
        />
      )}
    </>
  )
}
