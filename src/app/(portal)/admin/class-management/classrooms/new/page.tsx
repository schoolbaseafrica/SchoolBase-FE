"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClassroomForm } from "../_components/classroom-form"
import { SuccessModal } from "@/components/classrooms/success-modal"
import { useCreateClassroom } from "../_hooks/use-classrooms"
import { CreateClassroomData } from "@/types/classroom"

interface ClassroomFormData {
  name: string
  capacity: string
  type: string
  location: string
}

export default function CreateClassroomPage() {
  const router = useRouter()
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const createClassroomMutation = useCreateClassroom()

  async function handleCancel() {
    router.push("/admin/class-management/classrooms")
  }

  async function handleSubmit(formData: ClassroomFormData) {
    const classroomData: CreateClassroomData = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      type: formData.type,
      location: formData.location,
      // Remove description from payload
    }

    await createClassroomMutation.mutateAsync(classroomData)
    setSuccessModalOpen(true)
  }

  const handleContinue = () => {
    setSuccessModalOpen(false)
    router.push("/admin/class-management/classrooms")
  }

  return (
    <div className="mb-10 w-full space-y-8 bg-white p-4 md:px-10 md:py-4">
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
        <div className="md:px-8">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Create New Room</h1>
          <p className="text-gray-600">
            Add a new room with its name, type, capacity and location to <br /> manage
            academic operations.
          </p>
        </div>
      </div>

      <div className="md:px-8">
        <ClassroomForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createClassroomMutation.isPending}
          submitText="Create Classroom"
        />
      </div>

      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Classroom Created Successfully"
        description="Classroom has been activated successfully"
        onContinue={handleContinue}
      />
    </div>
  )
}
