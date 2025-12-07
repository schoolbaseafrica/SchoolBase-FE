"use client"

import React from "react"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface PaymentSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => void
  data: {
    studentName: string
    amountPaid: string
    feeComponent: string
    transactionId: string
    date: string
  } | null
}

export function PaymentSuccessModal({
  open,
  onOpenChange,
  onReset,
  data,
}: PaymentSuccessModalProps) {
  const router = useRouter()

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] rounded-xl sm:max-w-[500px]">
        <DialogHeader className="flex flex-col items-center space-y-4 pt-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Check className="h-6 w-6 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Payment Recorded Successfully!
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-500">
              The student&apos;s fee record have been update
            </p>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Student Name</span>
            <span className="text-right font-semibold text-gray-900">
              {data.studentName}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Amount Paid</span>
            <span className="text-right font-semibold text-gray-900">
              {data.amountPaid}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Fee</span>
            <span className="text-right font-semibold text-gray-900">
              {data.feeComponent}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Transaction ID</span>
            <span className="text-right font-semibold break-all text-gray-900">
              {data.transactionId}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Date</span>
            <span className="text-right font-semibold text-gray-900">{data.date}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 flex-1 text-sm font-medium"
            onClick={() => {
              onReset()
              onOpenChange(false)
            }}
          >
            Record Another Payment
          </Button>
          <Button
            className="h-11 flex-1 bg-[#DA3743] text-sm font-medium hover:bg-[#DA3743]/90"
            onClick={() => router.push("/admin/fees-record")}
          >
            View Updated Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
