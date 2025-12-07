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
import { Loader2 } from "lucide-react"
import { SnakeUser as User } from "@/types/user"

interface SelectedStudent {
  student: User
  relationship: string
}

interface LinkConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  parent: User
  selectedStudents: SelectedStudent[]
}

const relationshipLabels: Record<string, string> = {
  father: "Father",
  mother: "Mother",
  guardian: "Guardian",
  other: "Other",
}

export default function LinkConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  parent,
  selectedStudents,
}: LinkConfirmationDialogProps) {
  const [isLinking, setIsLinking] = useState(false)

  const handleConfirm = async () => {
    setIsLinking(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Link error:", error)
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Student Linking</DialogTitle>
          <DialogDescription>
            You are about to link {selectedStudents.length} student
            {selectedStudents.length > 1 ? "s" : ""} to {parent.first_name}{" "}
            {parent.last_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-60 space-y-3 overflow-y-auto py-4">
          {selectedStudents.map(({ student, relationship }) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {student.registration_number} {/*  • {student.class}  */}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {relationshipLabels[relationship] || relationship}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLinking}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLinking}>
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              `Link ${selectedStudents.length} Student${selectedStudents.length > 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
