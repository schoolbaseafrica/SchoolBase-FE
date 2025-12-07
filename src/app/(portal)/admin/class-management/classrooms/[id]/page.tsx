"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClassroomForm } from "../_components/classroom-form"
import { SuccessModal } from "@/components/classrooms/success-modal"
import { useGetClassroom, useUpdateClassroom } from "../_hooks/use-classrooms"
import { UpdateClassroomData } from "@/types/classroom"

interface ClassroomFormData {
  name: string
  capacity: string
  type: string
  location: string
}

export default function EditClassroomPage() {
  const { id } = useParams()
  const router = useRouter()
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const { data: classroom, isLoading, isError, error } = useGetClassroom(id as string)
  const updateClassroomMutation = useUpdateClassroom(id as string)

  async function handleCancel() {
    router.push("/admin/class-management/classrooms")
  }

  async function handleSubmit(formData: ClassroomFormData) {
    if (!id) return

    const updateData: UpdateClassroomData = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      type: formData.type,
      location: formData.location,
      // Remove description from payload
    }

    await updateClassroomMutation.mutateAsync(updateData)
    setSuccessModalOpen(true)
  }

  const handleContinue = () => {
    setSuccessModalOpen(false)
    router.push("/admin/class-management/classrooms")
  }

  if (isLoading) {
    return (
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-gray-600">Loading classroom details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !classroom) {
    return (
      <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {error?.message || "Classroom Not Found"}
            </h2>
            <p className="mb-6 text-gray-600">
              {error?.message || "The classroom you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/admin/class-management/classrooms">Back to Classrooms</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const initialData: ClassroomFormData = {
    name: classroom.name,
    capacity: classroom.capacity.toString(),
    type: classroom.type,
    location: classroom.location,
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
            <Link href="/admin/class-management/classrooms">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Classroom</h1>
        <p className="text-gray-600">Update classroom details.</p>
      </div>

      <div className="md:px-8">
        <ClassroomForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateClassroomMutation.isPending}
          submitText="Update Classroom"
        />
      </div>

      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Classroom Updated Successfully"
        description="Classroom has been successfully updated"
        onContinue={handleContinue}
      />
    </div>
  )
}
