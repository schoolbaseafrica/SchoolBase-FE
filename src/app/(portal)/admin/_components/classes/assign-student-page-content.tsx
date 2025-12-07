"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, CheckCircle, Loader2Icon, DotIcon } from "lucide-react"
import { ItemsError } from "../loading-error"
import { useGetStudentsWithMeta } from "../../students/_hooks/use-students"
import {
  useGetClass,
  useGetClassStudents,
  useAddStudentsToClass,
} from "../../class-management/_hooks/use-classes"
import { useParams } from "next/navigation"
import NotFound from "@/app/not-found"
import { StudentsLoadingSkeleton } from "./students-loading-skeleton"
import Link from "next/link"

const CLASS_PAGE = (classID: string) => `/admin/class-management/class/${classID}`

export default function AssignStudentsPageContent() {
  const classID = useParams().classID as string
  const [searchQuery, setSearchQuery] = useState<string>()
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

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
  const availableStudents =
    students &&
    students.filter(
      (s) => classmatesIDs && !classmatesIDs.includes(s.id) && s.current_class_id === null
    )

  const isLoading = isLoadingStudents || isLoadingClassmates || isLoadingClass
  const isError = isErrorStudents || isErrorClassmates || isErrorClass
  const error = errorStudents || errorClassmates || errorClass

  if (!classID) {
    return <NotFound />
  }

  return (
    <>
      {isLoading ? (
        <StudentsLoadingSkeleton />
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
                        {student.full_name}
                      </h5>
                      <p className="text-text-secondary mt-0.5 text-xs">
                        {student.registration_number}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-text-secondary text-sm">
                  {searchQuery
                    ? "No students found matching your search"
                    : "All students have been assigned to this class"}
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

    try {
      await addStudentsMutation.mutateAsync(allAssignedStudents)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Failed to assign student:", error)
    }
  }
}
