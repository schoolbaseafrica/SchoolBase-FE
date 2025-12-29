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
import { Loader2Icon, Search, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { useAssignTeacherToClass } from "../_hooks/use-assign-teacher-to-class"
import { ItemLoader } from "../../_components/sub-loader"
import { ItemsError } from "../../_components/loading-error"

interface AssignClassDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  teacherId: string
  teacherName: string
  currentClassId?: string | null
  onSuccess?: () => void
}

export default function AssignClassDialog({
  open,
  setOpen,
  teacherId,
  teacherName,
  currentClassId,
  onSuccess,
}: AssignClassDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    data: classesInfo,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
  } = useGetClassesInfo({ includeArchived: false })

  const assignMutation = useAssignTeacherToClass()

  // Flatten the grouped classes structure
  const allClasses =
    classesInfo?.items?.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
      }))
    ) || []

  // Filter classes based on search query and exclude current class if exists
  const filteredClasses = allClasses.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    const isNotCurrentClass = currentClassId ? cls.id !== currentClassId : true
    return matchesSearch && isNotCurrentClass
  })

  // Handle dialog open/close state
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // Reset state when dialog closes
    if (!newOpen) {
      setSelectedClassId(null)
      setSearchQuery("")
    } else {
      // Reset state when dialog opens
      setSelectedClassId(null)
      setSearchQuery("")
    }
  }

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }

    try {
      await assignMutation.mutateAsync({
        teacherId,
        classId: selectedClassId,
      })
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      // Don't close the dialog on error so user can retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Teacher to Class</DialogTitle>
          <DialogDescription>
            Select a class to assign {teacherName} as the class teacher.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoadingClasses && (
            <div className="flex items-center justify-center py-8">
              <ItemLoader item="classes" />
            </div>
          )}

          {/* Error State */}
          {isErrorClasses && (
            <ItemsError
              item="classes"
              errorMessage={
                errorClasses instanceof Error
                  ? errorClasses.message
                  : "Failed to load classes"
              }
              reload={() => queryClient.invalidateQueries({ queryKey: ["classes"] })}
            />
          )}

          {/* Classes List */}
          {!isLoadingClasses && !isErrorClasses && (
            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-md border p-2">
              {filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? "No classes found matching your search"
                      : "No classes available"}
                  </p>
                </div>
              ) : (
                filteredClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      selectedClassId === cls.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cls.name}</span>
                      {selectedClassId === cls.id && (
                        <div className="bg-primary h-2 w-2 rounded-full" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedClassId || assignMutation.isPending}
            >
              {assignMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
