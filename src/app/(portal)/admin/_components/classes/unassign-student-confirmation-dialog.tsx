"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface UnassignConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  title?: string
  description?: string
  className: string
}

export function UnassignStudentConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Unassign Student from Class",
  description = "Are you sure you want to unassign this student from the class?",
  className,
}: UnassignConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      console.error("An unexpected error occured while unassigning the student.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            You are about to unassign the student from the class{" "}
            <strong> {className} </strong>.
          </p>
        </div>
        <DialogFooter className="grid grid-cols-1 md:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Unassigning..." : "Unassign Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
