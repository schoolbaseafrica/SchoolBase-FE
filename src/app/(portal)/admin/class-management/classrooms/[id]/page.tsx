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
import { FormSkeleton } from "@/components/ui/form-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

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
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <FormSkeleton fields={4} showHeader={false} />
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
              {error?.message || "Room Not Found"}
            </h2>
            <p className="mb-6 text-gray-600">
              {error?.message || "The room you're looking for doesn't exist."}
            </p>
            <Button asChild size="lg" className="whitespace-nowrap">
              <Link href="/admin/class-management/classrooms">Back to Rooms</Link>
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
        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Room</h1>
        <p className="text-gray-600">Update room details.</p>
      </div>

      <div className="md:px-8">
        <ClassroomForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateClassroomMutation.isPending}
          submitText="Update Room"
        />
      </div>

      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Room Updated Successfully"
        description="Room has been successfully updated"
        onContinue={handleContinue}
      />
    </div>
  )
}
