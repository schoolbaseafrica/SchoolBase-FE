"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Loader2Icon, CheckCircleIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ItemsError } from "../loading-error"
import { useGetStudentsWithMeta } from "../../students/_hooks/use-students"
import { useAddStudentsToClass } from "../../class-management/_hooks/use-classes"

interface AssignStudentsDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  classId: string
  className: string
  classmates: string[]
}

export default function AssignStudentsDialog({
  open,
  setOpen,
  classId,
  className,
  classmates,
}: AssignStudentsDialogProps) {
  const [searchQuery, setSearchQuery] = useState<string>()
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Fetch all available students
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGetStudentsWithMeta({ page: currentPage, search: searchQuery, limit: 20 })

  const addStudentsMutation = useAddStudentsToClass(classId)

  const students = studentsData?.data || []
  const totalPages = studentsData?.meta?.total_pages || 1
  const availableStudents = students && students.filter((s) => !classmates.includes(s.id))

  const isLoading = isLoadingStudents
  const isError = isErrorStudents
  const error = errorStudents

  return (
    <>
      <Dialog open={open && !showSuccessDialog} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Assign Students to {className}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select students to assign to this class
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <StudentsLoadingSkeleton />
          ) : isError ? (
            <ItemsError
              item="Students"
              reload={refetchStudents}
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
                  className="h-11 pr-4 pl-9"
                />
              </div>

              {/* Available Students Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {availableStudents.length} available{" "}
                  {availableStudents.length === 1 ? "student" : "students"}
                </p>
                <p className="text-sm text-gray-600">{selectedStudents.size} selected</p>
              </div>

              {/* Students List */}
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
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
                          onCheckedChange={() => handleToggleStudent(student.id)}
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
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={addStudentsMutation.isPending}
                >
                  Cancel
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
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <div className="flex w-full flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="size-10 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
              Class Students Updated Successfully
            </DialogTitle>
            <DialogDescription className="text-text-secondary mb-6 text-sm">
              {selectedStudents.size}{" "}
              {selectedStudents.size === 1 ? "student has" : "students have"} been
              assigned to {className}
            </DialogDescription>
            <Button onClick={handleCloseSuccess} className="w-full">
              Done
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

  function handleCloseSuccess() {
    setSelectedStudents(new Set())
    setShowSuccessDialog(false)
    setOpen(false)
  }
}

function StudentsLoadingSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {/* Search Skeleton */}
      <Skeleton className="h-11 w-full" />

      {/* Count Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Students List Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
            <Skeleton className="mt-0.5 h-5 w-5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  )
}
