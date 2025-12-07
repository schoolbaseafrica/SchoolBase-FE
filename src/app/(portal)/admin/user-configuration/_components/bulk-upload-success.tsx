"use client"

import { useRouter } from "next/navigation"
import { PiSealCheckFill } from "react-icons/pi"

import { Button } from "@/components/ui/button"

interface BulkUploadSuccessProps {
  title?: string
  subtitle?: string
}

export function BulkUploadSuccess({
  title = "Bulk Upload Complete",
  subtitle = "Your Invitations Has Been Processed Successfully",
}: BulkUploadSuccessProps) {
  const router = useRouter()

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center bg-white pt-24">
      <div className="flex flex-col items-center gap-6">
        <PiSealCheckFill size={90} color="#10B981" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-outfit text-2xl leading-6 font-semibold text-[#2d2d2d]">
            {title}
          </h2>
          <p className="font-outfit text-sm leading-none font-normal text-[#535353]">
            {subtitle}
          </p>
        </div>
      </div>
      <Button
        onClick={() => router.replace("/admin/user-configuration?tab=pending")}
        className="mt-[60px] min-w-[200px] bg-[#DA3743] hover:bg-[#DA3743]/90"
      >
        Go Back to User Configuration
      </Button>
    </div>
  )
}
