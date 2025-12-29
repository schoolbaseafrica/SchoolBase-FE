"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle, Loader2Icon, Search, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useGetClassesInfo, useGetClass } from "../../class-management/_hooks/use-classes"
import { useAssignStudentToClass } from "../../class-management/_hooks/use-classes"
import { ClassesAPI } from "@/lib/classes"
import { ItemLoader } from "../../_components/sub-loader"
import { ItemsError } from "../../_components/loading-error"

interface AssignClassDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  studentId: string
  studentName: string
  currentClassId?: string | null
  onSuccess?: () => void
}

export default function AssignClassDialog({
  open,
  setOpen,
  studentId,
  studentName,
  currentClassId,
  onSuccess,
}: AssignClassDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showMoveConfirmationDialog, setShowMoveConfirmationDialog] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: classesInfo,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClassesInfo({ includeArchived: false })

  const assignMutation = useAssignStudentToClass()

  // Flatten the grouped classes structure (include all classes, not filtering current)
  const allClasses =
    classesInfo?.items?.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
        groupName: group.name,
      }))
    ) || []

  // Fetch current class details if student has one
  const { data: currentClass } = useGetClass(currentClassId || "", {
    enabled: !!currentClassId,
  })

  // Filter classes based on search query
  const filteredClasses = allClasses.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset selected class when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedClassId(null)
      setSearchQuery("")
      setShowMoveConfirmationDialog(false)
    }
  }, [open])

  const selectedClassName = allClasses.find((cls) => cls.id === selectedClassId)?.name
  const currentClassName = currentClass
    ? `${currentClass.name}${currentClass.arm ? ` ${currentClass.arm}` : ""}`
    : allClasses.find((cls) => cls.id === currentClassId)?.name || "current class"

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }

    // If student already has a class and selected a different one, show confirmation
    if (currentClassId && currentClassId !== selectedClassId) {
      setShowMoveConfirmationDialog(true)
      return
    }

    // Proceed with assignment
    await performAssignment()
  }

  const performAssignment = async () => {
    if (!selectedClassId) return

    try {
      // Verify the selected class is not archived (safeguard)
      const selectedClass = allClasses.find((cls) => cls.id === selectedClassId)
      if (!selectedClass) {
        toast.error("Selected class not found. Please refresh and try again.")
        setShowMoveConfirmationDialog(false)
        return
      }

      // If student has a current class, unassign from it first
      if (currentClassId && currentClassId !== selectedClassId) {
        await ClassesAPI.removeStudentFromClass(currentClassId, studentId)
      }

      // Then assign to new class
      await assignMutation.mutateAsync({
        classId: selectedClassId,
        studentId: studentId,
      })
      setShowSuccessDialog(true)
      setShowMoveConfirmationDialog(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation, but log for debugging
      console.error("Assignment error:", error)
      setShowMoveConfirmationDialog(false)
    }
  }

  const handleClose = () => {
    setShowSuccessDialog(false)
    setOpen(false)
    setSelectedClassId(null)
    setSearchQuery("")
  }

  return (
    <>
      <Dialog
        open={open && !showSuccessDialog && !showMoveConfirmationDialog}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Assign Class to {studentName}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select a class to assign this student to
            </DialogDescription>
          </DialogHeader>

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
              {/* Search Bar */}
              <div className="relative">
                <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                          isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
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
                          {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
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
                      {searchQuery
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
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={assignMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedClassId || assignMutation.isPending}
                  className="flex-1"
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign to Class"
                  )}
                </Button>
              </div>
            </div>
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
              Student Assigned Successfully
            </DialogTitle>
            <DialogDescription className="text-text-secondary mb-6 text-sm">
              {studentName} has been assigned to the selected class
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
