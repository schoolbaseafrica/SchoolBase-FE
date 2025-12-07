"use client"

import { useParams, useRouter } from "next/navigation"
import { UpdateStudentData } from "@/lib/students"
import {
  NewPersonFormBuilder,
  FormField,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { ArrowLeftIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGetStudent, useUpdateStudent } from "../_hooks/use-students"
import { studentFormConfig } from "../new/components/new-student-form"

export default function EditStudentPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: student, isLoading, isError, error } = useGetStudent(id as string)
  const updateStudentMutation = useUpdateStudent(id as string)

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
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-gray-600">Loading student details...</p>
          </div>
        </div>
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
    ...studentFormConfig.fields.map((field) => {
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
    ...studentFormConfig,
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

  return (
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
  )
}
