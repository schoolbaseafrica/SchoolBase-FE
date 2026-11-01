"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { StudentsAPI } from "@/lib/students"
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

  const { isLoading: isLoadingLinked } = useGetLinkedStudents(id)
  const linkParentToStudentsMutation = useLinkParentToStudents(id)

  const { data: parent, isLoading: isLoadingParent } = useGetParent(id as string)
  const {
    data: allStudents,
    isLoading: isLoadingStudents,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ["students", "available-for-parent-link"],
    queryFn: async () => {
      const students: User[] = []
      let page = 1
      let total = 0
      do {
        const response = await StudentsAPI.getAll({ page, limit: 100 })
        students.push(...response.data)
        total = response.meta?.total ?? students.length
        page += 1
      } while (students.length < total)
      return students
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })

  const currentSelectedStudents = useMemo(
    () =>
      selectedStudents
        .map((selection) => ({
          ...selection,
          student:
            allStudents?.find((student) => student.id === selection.student.id) ??
            selection.student,
        }))
        .filter((selection) => selection.student.parent_id !== id),
    [selectedStudents, allStudents, id]
  )

  // Filter students client-side based on search query
  const students = useMemo(() => {
    if (!allStudents) return []
    if (!searchQuery.trim()) return allStudents
    const query = searchQuery.toLowerCase()
    return allStudents.filter((student) =>
      `${student.first_name} ${student.last_name} ${student.registration_number || student.reg_number || ""}`
        .toLowerCase()
        .includes(query)
    )
  }, [allStudents, searchQuery])

  const handleStudentSelect = (student: User, selected: boolean) => {
    if (student.parent_id === id) return
    if (selected) {
      setSelectedStudents((prev) =>
        prev.some((item) => item.student.id === student.id)
          ? prev
          : [...prev, { student, relationship: "father" }]
      )
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
    const studentIds = currentSelectedStudents.map((s) => s.student.id)
    try {
      await linkParentToStudentsMutation.mutateAsync({
        studentIds,
        allowReassignment: currentSelectedStudents.some(
          (s) => !!s.student.parent_id && s.student.parent_id !== id
        ),
        expectedParentIds: Object.fromEntries(
          currentSelectedStudents.map((s) => [s.student.id, s.student.parent_id ?? null])
        ),
      })
      toast.success(
        `Successfully linked ${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} to parent`
      )
      setSelectedStudents([])
      await refetchStudents()
    } catch (error) {
      // The mutation displays the API error; keep the confirmation open.
      throw error
    }
  }

  const filteredStudents =
    students?.filter(
      (student) =>
        !currentSelectedStudents.some((selected) => selected.student.id === student.id)
    ) || []

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
              <h1 className="text-2xl font-bold text-gray-900">
                Assign Students to Parent
              </h1>
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
        {currentSelectedStudents.length > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
            <h3 className="font-semibold text-blue-900">
              {currentSelectedStudents.length} student
              {currentSelectedStudents.length > 1 ? "s" : ""} selected for linking
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
              selectedStudents={currentSelectedStudents}
              currentParentId={id}
              onStudentSelect={handleStudentSelect}
              onRelationshipChange={handleRelationshipChange}
              isLoading={isLoadingStudents}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            <LinkStudentsTable
              students={filteredStudents}
              selectedStudents={currentSelectedStudents}
              currentParentId={id}
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
              onClick={async () => {
                const refreshed = await refetchStudents()
                if (refreshed.isError) {
                  toast.error("Could not refresh student assignments. Please try again.")
                  return
                }
                setShowConfirmation(true)
              }}
              disabled={currentSelectedStudents.length === 0}
            >
              {currentSelectedStudents.some(
                (s) => s.student.parent_id && s.student.parent_id !== id
              )
                ? "Review assignment changes"
                : "Review student assignment"}
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <LinkConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={handleLinkStudents}
          parent={parent}
          selectedStudents={currentSelectedStudents}
        />
      </div>
    </div>
  )

  function handleClearSelection() {
    setSelectedStudents([])
  }
}
