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
      console.log("[AssignStudentsDialog] Fetching assigned students for fee:", fee.id)
      const response = await apiFetch<{ message: string; data: FeeStudent[] }>(
        `/fees/${fee.id}/students`,
        undefined,
        true
      )
      
      // Debug: Log full response structure
      console.log("[AssignStudentsDialog] Raw API response:", {
        fullResponse: response,
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!(response as any)?.data,
        dataType: typeof (response as any)?.data,
        dataIsArray: Array.isArray((response as any)?.data),
        hasNestedData: !!(response as any)?.data?.data,
        nestedDataType: typeof (response as any)?.data?.data,
        nestedDataIsArray: Array.isArray((response as any)?.data?.data),
        dataLength: Array.isArray((response as any)?.data) ? (response as any).data.length : "not array",
        nestedDataLength: Array.isArray((response as any)?.data?.data) ? (response as any).data.data.length : "not array",
        responseKeys: response ? Object.keys(response as any) : [],
        dataKeys: (response as any)?.data ? Object.keys((response as any).data) : [],
      })
      
      // Handle response structure: TransformInterceptor wraps it as { status_code, message, data: { data: [...] } }
      // Check for nested data first (double-wrapped), then fall back to direct data
      const responseData = (response as any)?.data
      const students: FeeStudent[] = Array.isArray(responseData?.data) 
        ? responseData.data 
        : Array.isArray(responseData) 
        ? responseData 
        : []
      const assignedIds = new Set(students.map((s: FeeStudent) => s.id))
      
      console.log("[AssignStudentsDialog] Fetched assigned students:", {
        fee_id: fee.id,
        fee_name: fee.component_name,
        response_data: (response as any)?.data,
        students_count: students.length,
        assigned_ids: Array.from(assignedIds),
        student_details: students.map((s: FeeStudent) => ({ id: s.id, name: s.name }))
      })
      
      setAssignedStudentIds(assignedIds)
    } catch (error) {
      console.error("[AssignStudentsDialog] Failed to fetch assigned students:", {
        fee_id: fee?.id,
        error: error instanceof Error ? error.message : String(error),
        error_details: error
      })
      // Set empty set on error to prevent UI issues
      setAssignedStudentIds(new Set())
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
  
  // Check if user is trying to assign already-assigned students
  const attemptingToAssignAlreadyAssigned = selectedStudentIds.size > 0 && 
    toAssign.length === 0 && 
    toUnassign.length === 0
  
  // Show warning if trying to assign already-assigned (though this shouldn't happen with our UI)
  const hasValidSelections = toAssign.length > 0 || toUnassign.length > 0

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
    if (!fee?.id || !hasValidSelections) return

    try {
      console.log("[AssignStudentsDialog] Submitting assignments:", {
        fee_id: fee.id,
        fee_name: fee.component_name,
        toAssign: toAssign,
        toAssign_count: toAssign.length,
        toUnassign: toUnassign,
        toUnassign_count: toUnassign.length,
        current_assigned_ids: Array.from(assignedStudentIds),
      })

      // Only assign if there are new students to assign
      if (toAssign.length > 0) {
        console.log("[AssignStudentsDialog] Assigning students:", toAssign)
        const assignResult = await assignMutation.mutateAsync(toAssign)
        console.log("[AssignStudentsDialog] Assignment result:", assignResult)
      }

      // Only unassign if there are students to unassign
      if (toUnassign.length > 0) {
        console.log("[AssignStudentsDialog] Unassigning students:", toUnassign)
        const unassignResult = await unassignMutation.mutateAsync(toUnassign)
        console.log("[AssignStudentsDialog] Unassignment result:", unassignResult)
      }

      // Wait a bit for backend to update
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh assigned students list
      console.log("[AssignStudentsDialog] Refreshing assigned students list after submission")
      await fetchAssignedStudents()

      // Clear selections
      setSelectedStudentIds(new Set())
      
      // Call onSuccess to refresh fee list in parent component
      onSuccess?.()
      
      // Don't close dialog immediately, let user see the updated state
      // User can close manually or we can close after a short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("[AssignStudentsDialog] Failed to update student assignments:", {
        fee_id: fee?.id,
        error: error instanceof Error ? error.message : String(error),
        error_details: error
      })
      // Don't close on error
    }
  }

  const isPending = assignMutation.isPending || unassignMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        aria-describedby="assign-students-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assign Students to Fee
          </DialogTitle>
          <DialogDescription id="assign-students-description" className="text-sm">
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
            <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 font-medium">
                    {selectedStudentIds.size} selected
                  </span>
                  {toAssign.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      +{toAssign.length} new assignment{toAssign.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {toUnassign.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      -{toUnassign.length} to remove
                    </span>
                  )}
                </div>
                <div className="text-gray-600 font-medium">
                  {assignedStudentIds.size} currently assigned
                </div>
              </div>
              {attemptingToAssignAlreadyAssigned && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs text-yellow-800">
                    ⚠️ All selected students are already assigned to this fee. Select students from the "Available Students" section to add new assignments, or select from "Already Assigned" to remove them.
                  </p>
                </div>
              )}
            </div>

            {/* Students List */}
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {/* Already Assigned Students */}
              {assignedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2">
                    <Users className="h-4 w-4 text-blue-700" />
                    <span className="text-sm font-semibold text-blue-900">
                      Already Assigned ({assignedStudents.length})
                    </span>
                    <span className="ml-auto text-xs text-blue-700">
                      ✓ These students already have this fee assigned
                    </span>
                  </div>
                  {assignedStudents.map((student: SnakeUser) => {
                    const isSelected = selectedStudentIds.has(student.id)

                    return (
                      <div
                        key={student.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:border-gray-300 ${
                          isSelected
                            ? "border-red-500 bg-red-50"
                            : "border-blue-200 bg-blue-50"
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
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-gray-900">
                              {student.full_name}
                            </h5>
                            {!isSelected && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                Assigned
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {student.registration_number || student.email}
                          </p>
                          {isSelected && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              ✓ Selected to remove from this fee
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
            disabled={!hasValidSelections || isPending || attemptingToAssignAlreadyAssigned}
            title={
              attemptingToAssignAlreadyAssigned
                ? "Please select students from the 'Available Students' section to add new assignments"
                : !hasValidSelections
                ? "Please select students to assign or unassign"
                : undefined
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                {toAssign.length > 0 && toUnassign.length > 0
                  ? `Add ${toAssign.length} & Remove ${toUnassign.length}`
                  : toAssign.length > 0
                  ? `Assign ${toAssign.length} Student${toAssign.length !== 1 ? 's' : ''}`
                  : toUnassign.length > 0
                  ? `Remove ${toUnassign.length} Student${toUnassign.length !== 1 ? 's' : ''}`
                  : "Update Assignments"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
