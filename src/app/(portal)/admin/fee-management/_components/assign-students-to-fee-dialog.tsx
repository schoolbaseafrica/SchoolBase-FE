"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Loader2, Users } from "lucide-react"
import { SnakeUser } from "@/types/user"
import { useGetStudents } from "../../students/_hooks/use-students"
import {
  useAssignStudentsToFee,
  useUnassignStudentsFromFee,
} from "../_hooks/use-fees"
import type { FeeComponent } from "@/lib/fees-management"
import { apiFetch } from "@/lib/api/client"

interface AssignStudentsToFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee: FeeComponent | null
  onSuccess?: () => void
}

interface FeeStudent {
  id: string
  name: string
  registration_number?: string
}

export function AssignStudentsToFeeDialog({
  open,
  onOpenChange,
  fee,
  onSuccess,
}: AssignStudentsToFeeDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [assignedStudentIds, setAssignedStudentIds] = useState<Set<string>>(new Set())
  const [loadingAssigned, setLoadingAssigned] = useState(false)

  const { data: allStudents = [], isLoading: isLoadingStudents } = useGetStudents()
  const assignMutation = useAssignStudentsToFee(fee?.id || "")
  const unassignMutation = useUnassignStudentsFromFee(fee?.id || "")

  // Fetch already assigned students when dialog opens
  useEffect(() => {
    if (open && fee?.id) {
      fetchAssignedStudents()
    }
  }, [open, fee?.id])

  // Reset selections when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedStudentIds(new Set())
      setSearchQuery("")
    }
  }, [open])

  async function fetchAssignedStudents() {
    if (!fee?.id) return

    setLoadingAssigned(true)
    try {
      const response = await apiFetch<{ data: FeeStudent[] }>(
        `/fees/${fee.id}/students`,
        undefined,
        true
      )
      const assignedIds = new Set(response.data.map((s) => s.id))
      setAssignedStudentIds(assignedIds)
    } catch (error) {
      console.error("Failed to fetch assigned students:", error)
    } finally {
      setLoadingAssigned(false)
    }
  }

  // Filter students based on search
  const filteredStudents = allStudents.filter((student: SnakeUser) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.registration_number?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    )
  })

  // Separate students into assigned and unassigned
  const assignedStudents = filteredStudents.filter((s: SnakeUser) =>
    assignedStudentIds.has(s.id)
  )
  const unassignedStudents = filteredStudents.filter(
    (s: SnakeUser) => !assignedStudentIds.has(s.id)
  )

  // Get selected students to assign and unassign
  const toAssign = Array.from(selectedStudentIds).filter(
    (id) => !assignedStudentIds.has(id)
  )
  const toUnassign = Array.from(selectedStudentIds).filter((id) =>
    assignedStudentIds.has(id)
  )

  function handleToggleStudent(studentId: string) {
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

  async function handleSubmit() {
    if (!fee?.id || selectedStudentIds.size === 0) return

    try {
      // Assign new students
      if (toAssign.length > 0) {
        await assignMutation.mutateAsync(toAssign)
      }

      // Unassign selected students
      if (toUnassign.length > 0) {
        await unassignMutation.mutateAsync(toUnassign)
      }

      // Refresh assigned students list
      await fetchAssignedStudents()

      // Clear selections
      setSelectedStudentIds(new Set())
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update student assignments:", error)
    }
  }

  const isPending = assignMutation.isPending || unassignMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assign Students to Fee
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select or deselect students to assign or unassign them from "{fee?.component_name}".
            Already assigned students are shown at the top.
          </DialogDescription>
        </DialogHeader>

        {isLoadingStudents || loadingAssigned ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading students...</span>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search students by name, registration number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-9 pr-4"
              />
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {selectedStudentIds.size} selected
                </span>
                {toAssign.length > 0 && (
                  <span className="text-green-600">
                    +{toAssign.length} to assign
                  </span>
                )}
                {toUnassign.length > 0 && (
                  <span className="text-red-600">
                    -{toUnassign.length} to unassign
                  </span>
                )}
              </div>
              <div className="text-gray-600">
                {assignedStudentIds.size} currently assigned
              </div>
            </div>

            {/* Students List */}
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {/* Already Assigned Students */}
              {assignedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="h-4 w-4" />
                    <span>Already Assigned ({assignedStudents.length})</span>
                  </div>
                  {assignedStudents.map((student: SnakeUser) => {
                    const isSelected = selectedStudentIds.has(student.id)

                    return (
                      <div
                        key={student.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:border-gray-300 ${
                          isSelected
                            ? "border-red-500 bg-red-50"
                            : "border-blue-200 bg-blue-50/50"
                        }`}
                        onClick={() => handleToggleStudent(student.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleStudent(student.id)}
                          className={`mt-0.5 ${
                            isSelected ? "border-red-600 bg-red-600" : ""
                          }`}
                        />
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {student.full_name}
                          </h5>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {student.registration_number || student.email}
                          </p>
                          {isSelected && (
                            <p className="mt-1 text-xs text-red-600">
                              Will be unassigned
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Unassigned Students */}
              {unassignedStudents.length > 0 && (
                <div className="space-y-2">
                  {assignedStudents.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="h-4 w-4" />
                      <span>Available Students ({unassignedStudents.length})</span>
                    </div>
                  )}
                  {unassignedStudents.map((student: SnakeUser) => {
                    const isSelected = selectedStudentIds.has(student.id)

                    return (
                      <div
                        key={student.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-all hover:border-gray-300 ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
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
                          <p className="mt-0.5 text-xs text-gray-600">
                            {student.registration_number || student.email}
                          </p>
                          {isSelected && (
                            <p className="mt-1 text-xs text-green-600">
                              Will be assigned
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* No Results */}
              {filteredStudents.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? "No students found matching your search"
                      : "No students available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedStudentIds.size === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Assignments"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
