"use client"

import NotFound from "@/app/not-found"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CheckCircle, DotIcon, Loader2Icon, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useMemo } from "react"
import {
  useAddStudentsToClass,
  useGetClass,
  useGetClassStudents,
  useGetClassesInfo,
} from "../../class-management/_hooks/use-classes"
import { useGetStudentsWithMeta } from "../../students/_hooks/use-students"
import { ClassesAPI } from "@/lib/classes"
import { ItemsError } from "../loading-error"
import { ItemLoader } from "../sub-loader"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const CLASS_PAGE = (classID: string) => `/admin/class-management/class/${classID}`

export default function AssignStudentsPageContent() {
  const classID = useParams().classID as string
  const [searchQuery, setSearchQuery] = useState<string>()
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showMoveConfirmationDialog, setShowMoveConfirmationDialog] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: classData,
    isLoading: isLoadingClass,
    isError: isErrorClass,
    error: errorClass,
    refetch: refetchClass,
  } = useGetClass(classID)
  const className = classData && `${classData.name} ${classData.arm ?? ""}`

  const {
    data: classmates,
    isLoading: isLoadingClassmates,
    isError: isErrorClassmates,
    error: errorClassmates,
    refetch: refetchClassmates,
  } = useGetClassStudents(classID)
  const classmatesIDs = classmates ? classmates.map((s) => s.student_id) : []

  // Fetch all available students
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGetStudentsWithMeta({ page: currentPage, search: searchQuery, limit: 20 })

  const addStudentsMutation = useAddStudentsToClass(classID)

  const students = studentsData?.data || []
  const totalPages = studentsData?.meta?.total_pages || 1

  // Show all students except those already in this class
  const availableStudents =
    students && students.filter((s) => classmatesIDs && !classmatesIDs.includes(s.id))

  // Find students with existing class assignments (in other classes)
  const studentsWithExistingClasses = useMemo(() => {
    if (!availableStudents) return []
    return availableStudents
      .filter(
        (s) =>
          selectedStudents.has(s.id) &&
          s.current_class_id &&
          s.current_class_id !== classID
      )
      .map((s) => ({
        id: s.id,
        name: s.full_name || `${s.first_name} ${s.last_name}`,
        currentClassId: s.current_class_id!,
      }))
  }, [availableStudents, selectedStudents, classID])

  // Get all classes to map class IDs to names
  const { data: classesInfo } = useGetClassesInfo({ includeArchived: false })
  const allClasses =
    classesInfo?.items?.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
      }))
    ) || []
  const allClassesMap = useMemo(() => {
    const map = new Map<string, string>()
    allClasses.forEach((cls) => {
      map.set(cls.id, cls.name)
    })
    return map
  }, [allClasses])

  const isLoading = isLoadingStudents || isLoadingClassmates || isLoadingClass
  const isError = isErrorStudents || isErrorClassmates || isErrorClass
  const error = errorStudents || errorClassmates || errorClass

  if (!classID) {
    return <NotFound />
  }

  return (
    <>
      {isLoading ? (
        <ItemLoader item="students" />
      ) : isError ? (
        <ItemsError
          item="Students"
          reload={() => {
            if (isErrorStudents) refetchStudents()
            if (isErrorClassmates) refetchClassmates()
            if (isErrorClass) refetchClass()
          }}
          errorMessage={error?.message || "An unexpected error occurred."}
        />
      ) : (
        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pr-4 pl-9 md:w-auto"
            />
          </div>

          {/* Available Students Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">
                {availableStudents.length} available{" "}
                {availableStudents.length === 1 ? "student" : "students"}
              </p>
              <DotIcon className="size-5 text-gray-400" />
              <p className="text-sm text-gray-600">
                Current class size: {classmates ? classmates.length : 0}
              </p>
            </div>
            <p className="text-sm text-gray-600">{selectedStudents.size} selected</p>
          </div>

          {/* Students List */}
          <div className="grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2">
            {availableStudents.length > 0 ? (
              availableStudents.map((student) => {
                const isSelected = selectedStudents.has(student.id)

                return (
                  <div
                    key={student.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-all hover:border-gray-300 ${
                      isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                    onClick={() => handleToggleStudent(student.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      className={`mt-0.5 ${
                        isSelected ? "border-green-600 bg-green-600" : ""
                      }`}
                    />
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-gray-900">
                        {student.full_name ||
                          `${student.first_name} ${student.last_name}`}
                      </h5>
                      <p className="text-text-secondary mt-0.5 text-xs">
                        {student.registration_number}
                      </p>
                      {student.current_class_id && (
                        <p className="text-text-secondary mt-1 text-xs italic">
                          Currently in:{" "}
                          {allClassesMap.get(student.current_class_id) || "Another class"}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-text-secondary text-sm">
                  {searchQuery
                    ? "No students found matching your search"
                    : availableStudents && availableStudents.length === 0
                      ? "All students have been assigned to this class"
                      : "No students available"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1" disabled={addStudentsMutation.isPending}>
              <Link href={CLASS_PAGE(classID)}>Cancel</Link>
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={selectedStudents.size === 0 || addStudentsMutation.isPending}
              className="flex-1"
            >
              {addStudentsMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${selectedStudents.size} ${selectedStudents.size === 1 ? "Student" : "Students"}`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Move Confirmation Dialog */}
      <Dialog
        open={showMoveConfirmationDialog}
        onOpenChange={setShowMoveConfirmationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="size-10 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Move Students to New Class?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {studentsWithExistingClasses.length}{" "}
              {studentsWithExistingClasses.length === 1 ? "student is" : "students are"}{" "}
              currently assigned to another class and will be moved to {className}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Students with existing classes */}
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Students to be moved:
              </p>
              <ul className="space-y-1">
                {studentsWithExistingClasses.map((student) => (
                  <li key={student.id} className="text-sm text-gray-600">
                    <span className="font-medium">{student.name}</span>
                    {" - "}
                    <span className="text-gray-500">
                      {allClassesMap.get(student.currentClassId) || "Current class"}
                    </span>
                    {" → "}
                    <span className="font-medium text-blue-600">{className}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other students (if any) */}
            {studentsWithExistingClasses.length < selectedStudents.size && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  {selectedStudents.size - studentsWithExistingClasses.length} other{" "}
                  {selectedStudents.size - studentsWithExistingClasses.length === 1
                    ? "student"
                    : "students"}{" "}
                  will be newly assigned to {className}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowMoveConfirmationDialog(false)}
                className="flex-1"
                disabled={addStudentsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={performAssignment}
                disabled={addStudentsMutation.isPending}
                className="flex-1"
              >
                {addStudentsMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Moving...
                  </>
                ) : (
                  "Yes, Move Students"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <div className="flex w-full flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
              Class Students Updated Successfully
            </DialogTitle>
            <DialogDescription className="text-text-secondary mb-6 text-sm">
              {selectedStudents.size}{" "}
              {selectedStudents.size === 1 ? "student has" : "students have"} been
              assigned to {className}
            </DialogDescription>
            <Button asChild className="w-full">
              <Link href={CLASS_PAGE(classID)}>View Updated ClassList</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  function handleToggleStudent(studentId: string) {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  async function handleAssignStudents() {
    const allAssignedStudents = Array.from(selectedStudents)

    if (allAssignedStudents.length === 0) {
      toast.error("Please select at least one student")
      return
    }

    // Check if any students have existing class assignments
    if (studentsWithExistingClasses.length > 0) {
      setShowMoveConfirmationDialog(true)
      return
    }

    // Proceed with assignment if no existing classes
    await performAssignment()
  }

  async function performAssignment() {
    const allAssignedStudents = Array.from(selectedStudents)

    try {
      // Verify the class is still valid (not archived)
      if (!classData) {
        toast.error("Class not found. Please refresh and try again.")
        return
      }

      // First, unassign students from their current classes
      const unassignPromises = studentsWithExistingClasses.map((student) =>
        ClassesAPI.removeStudentFromClass(student.currentClassId, student.id).catch(
          (err) => {
            console.error(`Failed to unassign student ${student.id}:`, err)
            // Continue even if one fails
          }
        )
      )

      await Promise.all(unassignPromises)

      // Then assign them to the new class
      await addStudentsMutation.mutateAsync(allAssignedStudents)

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["students"] })
      await queryClient.invalidateQueries({ queryKey: ["class_students"] })

      setShowSuccessDialog(true)
      setShowMoveConfirmationDialog(false)
    } catch (error) {
      console.error("Failed to assign student:", error)
      setShowMoveConfirmationDialog(false)
    }
  }
}
