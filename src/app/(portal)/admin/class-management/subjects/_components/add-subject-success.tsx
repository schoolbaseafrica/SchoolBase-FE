"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

export default function AddedSubjectSuccess({
  open,
  setOpen,
  onNextAction,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onNextAction: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <DialogTitle className="mb-2 text-xl font-semibold">
            Subject Created
          </DialogTitle>
          <DialogDescription className="mb-6 text-sm">
            Your subject is created successfully. Add subject to classes to continue.
          </DialogDescription>
          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={() => {
                setOpen(false)
                onNextAction()
              }}
              className="w-full"
            >
              Assign subject to class
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Remind Me Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
