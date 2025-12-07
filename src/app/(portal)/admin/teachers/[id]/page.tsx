// app/admin/teachers/[id]/page.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import { UpdateTeacherData } from "@/lib/teachers"
import {
  FormField,
  NewPersonFormBuilder,
  // NewPersonFormConfig,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { ArrowLeftIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGetTeacher, useUpdateTeacher } from "../_hooks/use-teachers"
import { teacherFormConfig } from "../new/components/new-teacher-form"

export default function EditTeacherPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: teacher, isLoading, isError, error } = useGetTeacher(id as string)
  const updateTeacherMutation = useUpdateTeacher(id as string)

  async function handleCancel() {
    router.push("/admin/teachers")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!id) return

    try {
      const updateData: UpdateTeacherData = {
        title: formData.title as string,
        first_name: formData.firstName as string,
        last_name: formData.lastName as string,
        middle_name: formData.middleName as string,
        employment_id: formData.employmentId as string,
        phone: formData.phoneNumber as string,
        date_of_birth: formData.dateOfBirth as string,
        gender: formData.gender as string,
        home_address: formData.homeAddress as string,
      }

      await updateTeacherMutation.mutateAsync(updateData)
      setTimeout(() => {
        router.push("/admin/teachers")
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
            <p className="text-gray-600">Loading teacher details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !teacher) {
    return (
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {error?.message || "Teacher Not Found"}
            </h2>
            <p className="mb-6 text-gray-600">
              {error?.message || "The teacher you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/admin/teachers">Back to Teachers</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Create edit form fields for teacher
  const editFormFields: FormField[] = [
    // Keep employment ID but make it readonly
    {
      name: "employmentId",
      label: "Employment ID",
      type: "text",
      placeholder: "EMP-YYYY-XXX",
      required: true,
      readonly: true,
      disabled: true,
    },
    // Map through other fields
    ...teacherFormConfig.fields
      .filter((field) => field.name !== "employmentId") // Remove original employmentId
      .map((field: FormField) => {
        if (field.name === "generatedPassword") {
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

  const editTeacherFormConfig = {
    ...teacherFormConfig,
    fields: editFormFields,
    submitText: "Update",
  }

  // Prepare initial data for the form
  const initialData = {
    title: teacher.title,
    firstName: teacher.first_name,
    lastName: teacher.last_name,
    email: teacher.email,
    middleName: teacher.middle_name || "",
    employmentId: teacher.employment_id,
    dateOfBirth: teacher.date_of_birth,
    gender: teacher.gender,
    phoneNumber: teacher.phone,
    homeAddress: teacher.home_address,
    generatedPassword: "********", // Show placeholder for password
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
            <Link href="/admin/teachers">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Teacher</h1>
        <p className="text-gray-600">Update teacher details.</p>
      </div>
      <div>
        <NewPersonFormBuilder
          config={editTeacherFormConfig}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          isEditMode={true}
        />
      </div>
    </div>
  )
}
