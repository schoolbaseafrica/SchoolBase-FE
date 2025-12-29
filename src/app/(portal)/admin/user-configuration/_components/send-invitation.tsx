"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { BulkUploadForm } from "./bulk-upload-form"
import { InviteUserForm } from "./invite-user-form"

export function SendInvitation() {
  const [isBulk, setIsBulk] = useState(false)

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[#2d2d2d] capitalize">
            {isBulk ? "Bulk CSV Upload" : "Send Invitation"}
          </h2>
          <p className="text-[#666666]">
            {isBulk
              ? "Upload a CSV file to invite multiple users at once"
              : "Invite new users to the portal"}
          </p>
        </div>
        <Button onClick={() => setIsBulk(!isBulk)} className="lg:min-w-[200px]">
          {isBulk ? "Send Single Invite" : "Bulk Upload (CSV)"}
        </Button>
      </div>
      {isBulk ? <BulkUploadForm /> : <InviteUserForm />}
    </section>
  )
}
