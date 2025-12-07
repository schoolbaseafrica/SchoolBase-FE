"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ClassroomsToolbar } from "@/components/classrooms/classrooms-toolbar"
import { ClassroomCard } from "@/components/classrooms/classroom-card"
import { EmptyClassrooms } from "@/components/classrooms/empty-classrooms"
import { SuccessModal } from "@/components/classrooms/success-modal"
import {
  useGetClassrooms,
  useDeleteClassroom,
  useToggleClassroomAvailability,
} from "./_hooks/use-classrooms"
import { Classroom } from "@/types/classroom"

export default function ClassroomsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [successModal, setSuccessModal] = useState<{
    open: boolean
    title: string
    description: string
  }>({ open: false, title: "", description: "" })

  const { data: classrooms = [], isLoading } = useGetClassrooms()
  const deleteClassroomMutation = useDeleteClassroom()
  const toggleAvailabilityMutation = useToggleClassroomAvailability()

  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return []

    return classrooms.filter((classroom) => {
      const searchLower = searchQuery.toLowerCase()

      switch (filterType) {
        case "name":
          return classroom.name.toLowerCase().includes(searchLower)
        case "type":
          return classroom.type.toLowerCase().includes(searchLower)
        case "capacity":
          return classroom.capacity.toString().includes(searchLower)
        case "location":
          return classroom.location.toLowerCase().includes(searchLower)
        case "all":
        default:
          return (
            classroom.name.toLowerCase().includes(searchLower) ||
            classroom.type.toLowerCase().includes(searchLower) ||
            classroom.capacity.toString().includes(searchLower) ||
            classroom.location.toLowerCase().includes(searchLower)
          )
      }
    })
  }, [classrooms, searchQuery, filterType])

  const handleEdit = (classroom: Classroom) => {
    router.push(`/admin/class-management/classrooms/${classroom.id}`)
  }

  const handleDelete = async (classroom: Classroom) => {
    try {
      await deleteClassroomMutation.mutateAsync(classroom.id)
      setSuccessModal({
        open: true,
        title: "Classroom Deleted Successfully",
        description: "The classroom has been successfully deleted from the system.",
      })
    } catch (error) {
      console.error("Failed to create teacher:", error)
      throw error
    }
  }

  const handleToggleAvailability = async (id: string, is_available: boolean) => {
    await toggleAvailabilityMutation.mutateAsync({ id, is_available })
  }

  const handleAddClassroom = () => {
    router.push("/admin/class-management/classrooms/new")
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-gray-600">Loading classrooms...</p>
          </div>
        </div>
      </div>
    )
  }

  if (classrooms.length === 0 && !searchQuery) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create Classroom</h1>
          <p className="text-muted-foreground">
            View, add and assign classroom to streamline academic operations
          </p>
        </div>
        <EmptyClassrooms />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-4">
      <ClassroomsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        onAddClassroom={handleAddClassroom}
      />

      {filteredClassrooms.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No classrooms found matching your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClassrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      <SuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal((prev) => ({ ...prev, open }))}
        title={successModal.title}
        description={successModal.description}
        onContinue={() => setSuccessModal({ open: false, title: "", description: "" })}
      />
    </div>
  )
}
