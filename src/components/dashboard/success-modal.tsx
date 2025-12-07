"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type SuccessModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message?: string // ← REQUIRED
  actionLabel?: string
  onAction?: () => void
}

export function SuccessModal({
  open,
  onOpenChange,
  title,
  message = "",
  actionLabel = "Continue",
  onAction,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6 text-center">
        <DialogHeader>
          <div className="mb-3 flex justify-center">
            <Image
              src="/assets/images/invited-user/vector.png"
              alt="check mark"
              width={80}
              height={80}
            />
          </div>

          <DialogTitle className="text-center text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}

        <Button
          className="mt-6 w-full rounded-md bg-red-600 py-5 text-base text-white hover:bg-red-700"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
