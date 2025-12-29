"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RejectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReject: (reason: string) => void
  isRejecting: boolean
}

export function RejectionModal({
  open,
  onOpenChange,
  onReject,
  isRejecting,
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("")

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason)
      setRejectionReason("")
    }
  }

  const handleCancel = () => {
    setRejectionReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Submission</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this submission. This will be visible to
            the teacher.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Label htmlFor="rejection-reason">Reason for rejection</Label>
          <Textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            rows={4}
          />
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isRejecting}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={!rejectionReason.trim() || isRejecting}
            variant="default"
          >
            {isRejecting ? "Rejecting..." : "Reject Submission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
