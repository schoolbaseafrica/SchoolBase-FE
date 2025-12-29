"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function EmptyClassrooms() {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/classrooms/empty-room.png"
            alt="No classrooms"
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
        <h3 className="mb-4 text-2xl font-bold text-gray-900">No Room yet</h3>
        <p className="mb-8 max-w-md text-gray-600">
          Create your first room with it’s name, description, and capacity to Manage
          academic operations.
        </p>
        <Button
          onClick={() => router.push("/admin/class-management/classrooms/new")}
          className="px-8 py-3"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Classroom
        </Button>
      </div>
    </div>
  )
}
