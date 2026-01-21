"use client"

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
import { CheckCircle, Loader2Icon, Search, Users, AlertTriangle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useGetClassesInfo, useGetClass } from "../../class-management/_hooks/use-classes"
import { useGetStudentsWithMeta } from "../_hooks/use-students"
import { ClassesAPI } from "@/lib/classes"
import { ItemLoader } from "../../_components/sub-loader"
import { ItemsError } from "../../_components/loading-error"

interface BulkAssignClassDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

export default function BulkAssignClassDialog({
  open,
  setOpen,
  onSuccess,
}: BulkAssignClassDialogProps) {
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [classSearchQuery, setClassSearchQuery] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showMoveConfirmationDialog, setShowMoveConfirmationDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState<"students" | "class">("students")
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch students
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGetStudentsWithMeta({ page: currentPage, search: studentSearchQuery, limit: 50 })

  // Fetch classes
  const {
    data: classesInfo,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClassesInfo({ includeArchived: false })

  // We'll use the mutation directly when we have the classId

  // Flatten the grouped classes structure
  const allClasses =
    classesInfo?.items?.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
        groupName: group.name,
      }))
    ) || []

  // Filter classes based on search query
  const filteredClasses = allClasses.filter((cls) =>
    cls.name.toLowerCase().includes(classSearchQuery.toLowerCase())
  )

  const students = studentsData?.data || []
  const totalPages = studentsData?.meta?.total_pages || 1

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.registration_number || ""}`
      .toLowerCase()
      .includes(studentSearchQuery.toLowerCase())
  )

  // Get mutation hook - we'll create it when we need it
  const [isAssigning, setIsAssigning] = useState(false)

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedClassId(null)
      setStudentSearchQuery("")
      setClassSearchQuery("")
      setSelectedStudentIds(new Set())
      setCurrentStep("students")
      setCurrentPage(1)
      setIsAssigning(false)
      setShowMoveConfirmationDialog(false)
    }
  }, [open])

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const handleNextToClassSelection = () => {
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student")
      return
    }
    setCurrentStep("class")
  }

  const handleClose = () => {
    setShowSuccessDialog(false)
    setOpen(false)
    setSelectedClassId(null)
    setStudentSearchQuery("")
    setClassSearchQuery("")
    setSelectedStudentIds(new Set())
    setCurrentStep("students")
    setIsAssigning(false)
  }

  const selectedClassName = allClasses.find((cls) => cls.id === selectedClassId)?.name
  const studentCount = selectedStudentIds.size

  // Find students with existing class assignments
  const studentsWithExistingClasses = useMemo(() => {
    const selectedStudents = students.filter((s) => selectedStudentIds.has(s.id))
    return selectedStudents
      .filter((s) => s.current_class_id && s.current_class_id !== selectedClassId)
      .map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        currentClassId: s.current_class_id!,
      }))
  }, [students, selectedStudentIds, selectedClassId])

  // Create a map of class IDs to class names for quick lookup
  const allClassesMap = useMemo(() => {
    const map = new Map<string, string>()
    allClasses.forEach((cls) => {
      map.set(cls.id, cls.name)
    })
    return map
  }, [allClasses])

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }

    if (selectedStudentIds.size === 0) {
      toast.error("No students selected")
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

  const performAssignment = async () => {
    if (!selectedClassId) return

    try {
      setIsAssigning(true)

      // Verify the selected class is not archived (safeguard)
      const selectedClass = allClasses.find((cls) => cls.id === selectedClassId)
      if (!selectedClass) {
        toast.error("Selected class not found. Please refresh and try again.")
        setIsAssigning(false)
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
      await ClassesAPI.addStudentsToClass(selectedClassId, Array.from(selectedStudentIds))

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["students"] })
      await queryClient.invalidateQueries({ queryKey: ["class_students"] })

      toast.success("Students assigned to class successfully")
      setShowSuccessDialog(true)
      setShowMoveConfirmationDialog(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign students to class")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <>
      <Dialog open={open && !showSuccessDialog} onOpenChange={setOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          aria-describedby="bulk-assign-class-description"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {currentStep === "students"
                ? "Select Students to Assign"
                : `Assign ${studentCount} ${studentCount === 1 ? "Student" : "Students"} to Class`}
            </DialogTitle>
            <DialogDescription id="bulk-assign-class-description" className="text-sm">
              {currentStep === "students"
                ? "Select the students you want to assign to a class"
                : `Select a class to assign ${studentCount === 1 ? "this student" : "these students"} to`}
            </DialogDescription>
          </DialogHeader>

          {currentStep === "students" ? (
            // Students Selection Step
            <>
              {isLoadingStudents ? (
                <ItemLoader item="students" />
              ) : isErrorStudents ? (
                <ItemsError
                  item="Students"
                  reload={refetchStudents}
                  errorMessage={errorStudents?.message || "An unexpected error occurred."}
                />
              ) : (
                <div className="space-y-4 pt-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      type="search"
                      placeholder="Search students..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="h-11 pr-4 pl-9"
                    />
                  </div>

                  {/* Selected Count */}
                  {selectedStudentIds.size > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">
                          {selectedStudentIds.size}{" "}
                          {selectedStudentIds.size === 1 ? "student" : "students"}{" "}
                          selected
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Students List */}
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const isSelected = selectedStudentIds.has(student.id)

                        return (
                          <div
                            key={student.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-all hover:border-gray-300 ${
                              isSelected
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                            onClick={() => handleStudentSelection(student.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleStudentSelection(student.id)}
                              className={`mt-0.5 ${
                                isSelected ? "border-green-600 bg-green-600" : ""
                              }`}
                            />
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-gray-900">
                                {student.first_name} {student.last_name}
                              </h5>
                              {student.registration_number && (
                                <p className="text-text-secondary mt-0.5 text-xs">
                                  {student.registration_number}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-text-secondary text-sm">
                          {studentSearchQuery
                            ? "No students found matching your search"
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
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNextToClassSelection}
                      disabled={selectedStudentIds.size === 0}
                      className="flex-1"
                    >
                      Next: Select Class
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Class Selection Step
            <>
              {isLoadingClasses ? (
                <ItemLoader item="classes" />
              ) : isErrorClasses ? (
                <ItemsError
                  item="Classes"
                  reload={refetchClasses}
                  errorMessage={errorClasses?.message || "An unexpected error occurred."}
                />
              ) : (
                <div className="space-y-4 pt-4">
                  {/* Selected Students Info */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        {studentCount} {studentCount === 1 ? "student" : "students"}{" "}
                        selected
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      type="search"
                      placeholder="Search classes..."
                      value={classSearchQuery}
                      onChange={(e) => setClassSearchQuery(e.target.value)}
                      className="h-11 pr-4 pl-9"
                    />
                  </div>

                  {/* Classes List */}
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((cls) => {
                        const isSelected = selectedClassId === cls.id

                        return (
                          <div
                            key={cls.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-all hover:border-gray-300 ${
                              isSelected
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedClassId(cls.id)}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                isSelected
                                  ? "border-green-600 bg-green-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-gray-900">
                                {cls.name}
                              </h5>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-text-secondary text-sm">
                          {classSearchQuery
                            ? "No classes found matching your search"
                            : "No classes available"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("students")}
                      className="flex-1"
                      disabled={isAssigning}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleAssign}
                      disabled={
                        !selectedClassId || isAssigning || selectedStudentIds.size === 0
                      }
                      className="flex-1"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        `Assign ${studentCount} ${studentCount === 1 ? "Student" : "Students"}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex w-full flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
              Students Assigned Successfully
            </DialogTitle>
            <DialogDescription className="text-text-secondary mb-6 text-sm">
              {studentCount} {studentCount === 1 ? "student has" : "students have"} been
              assigned to {selectedClassName}
            </DialogDescription>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
