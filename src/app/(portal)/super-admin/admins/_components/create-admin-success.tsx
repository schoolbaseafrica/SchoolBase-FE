"use client"

import { useRouter } from "next/navigation"
import { PiSealCheckFill } from "react-icons/pi"

import { Button } from "@/components/ui/button"

interface CreateAdminSuccessProps {
  title?: string
  subtitle?: string
}

export function CreateAdminSuccess({
  title = "Admin Account Created",
  subtitle = "The admin account has been created successfully. An email with login credentials has been sent to the admin.",
}: CreateAdminSuccessProps) {
  const router = useRouter()

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center bg-white pt-24">
      <div className="flex flex-col items-center gap-6">
        <PiSealCheckFill size={90} color="#10B981" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-outfit text-2xl leading-6 font-semibold text-[#2d2d2d]">
            {title}
          </h2>
          <p className="font-outfit text-sm leading-none font-normal text-[#535353] max-w-md">
            {subtitle}
          </p>
        </div>
      </div>
      <Button
        onClick={() => router.push("/super-admin/admins")}
        className="bg-accent hover:bg-accent/90 mt-[60px] min-w-[200px] text-white"
      >
        Back to Admins
      </Button>
    </div>
  )
}

