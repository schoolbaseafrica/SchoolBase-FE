"use client"

import { useEffect, useState } from "react"
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
import { Search, CheckCircle, Loader2Icon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ItemsError } from "../loading-error"
import {
  SubjectsAPI,
  useGetSubjects,
} from "../../class-management/subjects/_hooks/use-subjects"
import {
  useGetSubjectsForClass,
  SUBJECTS_FOR_CLASS_KEY,
} from "../../class-management/_hooks/use-classes"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface Subject {
  id: string
  name: string
  department?: string
}

interface AssignSubjectsDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  classId: string
  className: string
}

export default function AssignSubjectsDialog({
  open,
  setOpen,
  classId,
  className,
}: AssignSubjectsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const queryClient = useQueryClient()

  // Fetch all available subjects
  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    isError: isErrorSubjects,
    error: errorSubjects,
    refetch: refetchSubjects,
  } = useGetSubjects({ page: currentPage })

  // Fetch subjects already assigned to this class
  const {
    data: assignedSubjectsData,
    isLoading: isLoadingAssigned,
    isError: isErrorAssigned,
    error: errorAssigned,
    refetch: refetchAssigned,
  } = useGetSubjectsForClass(classId)

  const subjects = subjectsData?.data || []
  const assignedSubjects = assignedSubjectsData?.payload || []
  const assignedSubjectIds =
    assignedSubjects && assignedSubjects.map((item) => item.subject.id)
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set(assignedSubjectIds)
  )

  const totalPages = subjectsData?.pagination?.total_pages || 1

  const [isPending, setPending] = useState(false)

  // Filter out already assigned subjects and apply search
  const availableSubjects = subjects.filter((subject: Subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isLoading = isLoadingSubjects || isLoadingAssigned
  const isError = isErrorSubjects || isErrorAssigned
  const error = errorSubjects || errorAssigned

  return (
    <>
      <Dialog
        open={open && !showSuccessDialog}
        onOpenChange={isPending ? () => {} : setOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Assign Subjects to {className}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select subjects to assign to this class
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <SubjectsLoadingSkeleton />
          ) : isError ? (
            <ItemsError
              item="Subjects"
              reload={() => {
                refetchSubjects()
                refetchAssigned()
              }}
              errorMessage={error?.message || "An unexpected error occurred."}
            />
          ) : (
            <div className="space-y-4 pt-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pr-4 pl-9"
                />
              </div>

              {/* Available Subjects Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {availableSubjects.length} available{" "}
                  {availableSubjects.length === 1 ? "subject" : "subjects"}
                </p>
                <p className="text-sm text-gray-600">{selectedSubjects.size} selected</p>
              </div>

              {/* Subjects List */}
              <div className="space-y-2">
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject: Subject) => {
                    const isSelected = selectedSubjects.has(subject.id)

                    return (
                      <div
                        key={subject.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-all hover:border-gray-300 ${
                          isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                        onClick={() => handleToggleSubject(subject.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSubject(subject.id)}
                          className={`mt-0.5 ${
                            isSelected ? "border-green-600 bg-green-600" : ""
                          }`}
                        />
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {subject.name}
                          </h5>
                          {subject.department && (
                            <p className="text-text-secondary mt-0.5 text-xs">
                              {subject.department}
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
                        ? "No subjects found matching your search"
                        : "All subjects have been assigned to this class"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2 pt-2">
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
              <div className="sticky -bottom-2 flex gap-2 bg-white py-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSubjects}
                  disabled={selectedSubjects.size === 0 || isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    `Assign ${selectedSubjects.size} ${selectedSubjects.size === 1 ? "Subject" : "Subjects"}`
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
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
              Class Subjects Updated Successfully
            </DialogTitle>
            <DialogDescription className="text-text-secondary mb-6 text-sm">
              {selectedSubjects.size}{" "}
              {selectedSubjects.size === 1 ? "subject has" : "subjects have"} been
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

  function handleToggleSubject(subjectId: string) {
    setSelectedSubjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId)
      } else {
        newSet.add(subjectId)
      }
      return newSet
    })
  }

  async function handleAssignSubjects() {
    setPending(true)
    const allAssignedSubjects = Array.from(selectedSubjects)
    const newlyAssignedSubjects = allAssignedSubjects.filter(
      (sId) => !assignedSubjectIds.includes(sId)
    )
    const newlyUnassignedSubjects = assignedSubjectIds.filter(
      (sId) => !allAssignedSubjects.includes(sId)
    )

    try {
      await Promise.all([
        // Assign newly selected subjects
        ...newlyAssignedSubjects.map((subjectId) =>
          SubjectsAPI.assignToClasses(subjectId, [classId])
        ),
        // Unassign deselected subjects
        ...newlyUnassignedSubjects.map((subjectId) =>
          SubjectsAPI.unAssignToClasses(subjectId, [classId])
        ),
      ])
      setShowSuccessDialog(true)
      await queryClient.invalidateQueries({
        queryKey: [SUBJECTS_FOR_CLASS_KEY, classId],
      })
    } catch (error) {
      console.error("Failed to assign subject:", error)
      toast.error("Failed to assign subjects. Please try again.")
    } finally {
      setPending(false)
    }
  }

  function handleCloseSuccess() {
    setSelectedSubjects(new Set())
    setShowSuccessDialog(false)
    setOpen(false)
  }
}

function SubjectsLoadingSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {/* Search Skeleton */}
      <Skeleton className="h-11 w-full" />

      {/* Count Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Subjects List Skeleton */}
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
