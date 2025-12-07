"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  useGetLinkedStudents,
  useGetParent,
  useLinkParentToStudents,
} from "../../_hooks/use-parents"
import { useGetStudents } from "@/app/(portal)/admin/students/_hooks/use-students"
import { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"
import LinkStudentsGrid from "./components/link-students-grid"
import LinkStudentsTable from "./components/link-students-table"
import LinkConfirmationDialog from "./components/link-confirmation-dialog"

type SelectedStudent = {
  student: User
  relationship: string
}

export default function LinkParentPage() {
  const id = useParams()?.id as string
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { data: initLinkedStudents, isLoading: isLoadingLinked } =
    useGetLinkedStudents(id)
  const initiallySelected = useMemo(() => {
    if (!initLinkedStudents) return []

    return initLinkedStudents.map((student) => ({
      student,
      relationship: "",
    }))
  }, [initLinkedStudents])

  const linkParentToStudentsMutation = useLinkParentToStudents(id)

  const { data: parent, isLoading: isLoadingParent } = useGetParent(id as string)
  const { data: students, isLoading: isLoadingStudents } = useGetStudents({
    search: searchQuery,
  })

  const handleStudentSelect = (student: User, selected: boolean) => {
    if (selected) {
      setSelectedStudents((prev) => [...prev, { student, relationship: "father" }])
    } else {
      setSelectedStudents((prev) => prev.filter((s) => s.student.id !== student.id))
    }
  }

  const handleRelationshipChange = (studentId: string, relationship: string) => {
    setSelectedStudents((prev) =>
      prev.map((item) =>
        item.student.id === studentId ? { ...item, relationship } : item
      )
    )
  }

  const handleLinkStudents = async () => {
    const studentIds = selectedStudents.map((s) => s.student.id)
    try {
      await linkParentToStudentsMutation.mutateAsync(studentIds)
      toast.success(
        `Successfully linked ${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} to parent`
      )
      router.push(`/admin/parents/${id}`)
    } catch {
      toast.error("Failed to link students. Please try again.")
    }
  }

  const filteredStudents =
    students?.filter(
      (student) =>
        !selectedStudents.some((selected) => selected.student.id === student.id)
    ) || []

  useEffect(() => {
    if (initiallySelected) {
      setSelectedStudents(initiallySelected)
    }
  }, [initiallySelected])

  if (isLoadingParent || isLoadingLinked) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-gray-600">Loading parent details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Parent Not Found</h2>
            <p className="mb-6 text-gray-600">
              The parent you are looking for does not exist.
            </p>
            <Button asChild>
              <Link href="/admin/parents">Back to Parents</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              className="bg-white hover:bg-gray-100"
              size="icon"
            >
              <Link href={`/admin/parents/${id}`}>
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Link Parent to Student</h1>
              <p className="text-gray-600">
                Linking students to {parent.first_name} {parent.last_name}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>
        </div>

        {/* Selected Students Summary */}
        {selectedStudents.length > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
            <h3 className="font-semibold text-blue-900">
              {selectedStudents.length} student{selectedStudents.length > 1 ? "s" : ""}{" "}
              selected for linking
            </h3>
            <Button variant="outline" className="mt-2 h-8" onClick={handleClearSelection}>
              <span className="text-sm">Clear Selection</span>
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Mobile View */}
          <div className="block lg:hidden">
            <LinkStudentsGrid
              students={filteredStudents}
              selectedStudents={selectedStudents}
              onStudentSelect={handleStudentSelect}
              onRelationshipChange={handleRelationshipChange}
              isLoading={isLoadingStudents}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            <LinkStudentsTable
              students={filteredStudents}
              selectedStudents={selectedStudents}
              onStudentSelect={handleStudentSelect}
              onRelationshipChange={handleRelationshipChange}
              isLoading={isLoadingStudents}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => router.push(`/admin/parents/${id}`)}>
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={selectedStudents.length === 0}
            >
              Link Parent and Students
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <LinkConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={handleLinkStudents}
          parent={parent}
          selectedStudents={selectedStudents}
        />
      </div>
    </div>
  )

  function handleClearSelection() {
    setSelectedStudents(initiallySelected || [])
  }
}
