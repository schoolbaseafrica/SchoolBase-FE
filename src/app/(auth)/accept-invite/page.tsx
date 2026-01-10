"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Loading from "@/app/loading"
import AcceptInviteForm from "./_components/accept-invite-form"

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 px-6 py-4 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Invalid Invitation Link</h2>
          <p className="text-sm text-red-700">
            The invitation link is missing a token. Please check your email and use the complete link.
          </p>
        </div>
      </div>
    )
  }

  return <AcceptInviteForm token={token} />
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AcceptInviteContent />
    </Suspense>
  )
}
