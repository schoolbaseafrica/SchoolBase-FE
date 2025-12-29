"use client"

import Image from "next/image"
// import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  buttonText?: string
  onContinue?: () => void
}

export function SuccessModal({
  open,
  onOpenChange,
  title,
  description,
  buttonText = "Continue",
  onContinue,
}: SuccessModalProps) {
  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-[90px] w-[90px] items-center justify-center rounded-full md:h-52 md:w-52">
            <Image
              src="/classrooms/checkmark.png"
              alt="No classrooms"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button onClick={handleContinue} className="px-8">
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
