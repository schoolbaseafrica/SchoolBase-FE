"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useCreateClass } from "../../class-management/_hooks/use-classes"

interface MissingClassInfo {
  name: string
  arm?: string
  student_count: number
}

interface MissingClassesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingClasses: MissingClassInfo[]
  onClassesCreated: () => void
  onSkip: () => void
}

export function MissingClassesDialog({
  open,
  onOpenChange,
  missingClasses,
  onClassesCreated,
  onSkip,
}: MissingClassesDialogProps) {
  const [selectedClasses, setSelectedClasses] = useState<Set<number>>(
    new Set(missingClasses.map((_, index) => index))
  )
  const [isCreating, setIsCreating] = useState(false)
  const createClassMutation = useCreateClass()

  const handleToggleClass = (index: number) => {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleCreateSelected = async () => {
    if (selectedClasses.size === 0) {
      toast.error("Please select at least one class to create")
      return
    }

    setIsCreating(true)
    const classesToCreate = Array.from(selectedClasses).map(
      (index) => missingClasses[index]
    )

    try {
      // Create classes sequentially to avoid conflicts
      for (const classInfo of classesToCreate) {
        await createClassMutation.mutateAsync({
          name: classInfo.name,
          arm: classInfo.arm,
          teacherIds: [],
        })
      }

      toast.success(
        `Successfully created ${classesToCreate.length} class${classesToCreate.length > 1 ? "es" : ""}`
      )
      onClassesCreated()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create some classes")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSkip = () => {
    onSkip()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Missing Classes Detected
          </DialogTitle>
          <DialogDescription>
            The following classes referenced in your CSV do not exist. Select which
            classes you want to create before uploading students. Students assigned to
            unselected classes will be uploaded without class assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border p-4">
            {missingClasses.map((classInfo, index) => {
              const isSelected = selectedClasses.has(index)
              return (
                <div
                  key={index}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:border-gray-300 ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleToggleClass(index)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleClass(index)}
                    className={`mt-0.5 ${
                      isSelected ? "border-green-600 bg-green-600" : ""
                    }`}
                  />
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {classInfo.name}
                      {classInfo.arm && ` (Arm ${classInfo.arm})`}
                    </h5>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {classInfo.student_count} student
                      {classInfo.student_count !== 1 ? "s" : ""} will be assigned
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Classes will be created in the current active
              academic session. Students assigned to classes you choose not to create
              will be uploaded without class assignments and can be assigned later.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isCreating}>
            Skip (Upload Without Classes)
          </Button>
          <Button
            onClick={handleCreateSelected}
            disabled={selectedClasses.size === 0 || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Classes...
              </>
            ) : (
              `Create ${selectedClasses.size} Selected Class${selectedClasses.size !== 1 ? "es" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
