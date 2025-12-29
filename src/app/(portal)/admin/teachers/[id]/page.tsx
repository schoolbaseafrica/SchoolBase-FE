"use client"

import { useParams, useRouter } from "next/navigation"
import { UpdateTeacherData } from "@/lib/teachers"
import {
  FormField,
  NewPersonFormBuilder,
  // NewPersonFormConfig,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { ArrowLeftIcon, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGetTeacher, useUpdateTeacher } from "../_hooks/use-teachers"
import { teacherFormConfig } from "../new/components/new-teacher-form"
import { ItemLoader } from "../../_components/sub-loader"
import { useState } from "react"
import AssignClassDialog from "../_components/assign-class-dialog"
import { useGetTeacherClasses } from "../_hooks/use-teacher-classes"
import { Building2, Calendar } from "lucide-react"

export default function EditTeacherPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: teacher, isLoading, isError, error } = useGetTeacher(id as string)
  const updateTeacherMutation = useUpdateTeacher(id as string)
  const [assignClassDialogOpen, setAssignClassDialogOpen] = useState(false)
  const {
    data: assignedClasses,
    isLoading: classesLoading,
    isError: classesError,
  } = useGetTeacherClasses(id as string)

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
        <ItemLoader item="teacher details" />
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
  // Convert gender to lowercase to match form field options
  const initialData = {
    title: teacher.title,
    firstName: teacher.first_name,
    lastName: teacher.last_name,
    email: teacher.email,
    middleName: teacher.middle_name || "",
    employmentId: teacher.employment_id,
    dateOfBirth: teacher.date_of_birth,
    gender: teacher.gender?.toLowerCase() || teacher.gender, // Convert "Male"/"Female" to "male"/"female"
    phoneNumber: teacher.phone,
    homeAddress: teacher.home_address || "",
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Teacher</h1>
            <p className="text-gray-600">Update teacher details.</p>
          </div>
          <Button
            onClick={() => setAssignClassDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Assign to Class
          </Button>
        </div>
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

      {/* Assigned Classes Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assigned Classes</h2>
            <p className="text-sm text-gray-600">
              Classes currently assigned to this teacher
            </p>
          </div>
        </div>

        {classesLoading ? (
          <div className="py-8">
            <ItemLoader item="assigned classes" />
          </div>
        ) : classesError ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Failed to load assigned classes
          </div>
        ) : assignedClasses && assignedClasses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">
                        {classItem.name}
                        {classItem.arm && ` ${classItem.arm}`}
                      </h3>
                    </div>
                    {classItem.academicSession && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{classItem.academicSession.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No classes assigned</p>
            <p className="mt-1 text-sm text-gray-500">
              Click "Assign to Class" to assign this teacher to a class
            </p>
          </div>
        )}
      </div>

      {/* Assign Class Dialog */}
      {teacher && (
        <AssignClassDialog
          open={assignClassDialogOpen}
          setOpen={setAssignClassDialogOpen}
          teacherId={id as string}
          teacherName={`${teacher.first_name} ${teacher.last_name}`}
          onSuccess={() => {
            // Query will automatically refetch due to invalidation in the mutation
          }}
        />
      )}
    </div>
  )
}
