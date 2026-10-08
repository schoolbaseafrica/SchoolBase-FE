// path is /[userType]/[userID]

import Link from "next/link"
import NotFound from "@/app/not-found"

const ALLOWED_TYPES = ["teachers", "students", "parents"]

export default async function InvitedUserActivatePropsPage({
  params,
}: {
  params: Promise<{ userType: string; inviteID: string }>
}) {
  const { userType } = await params

  // if not expected userType redirect to actual 404 page
  if (!ALLOWED_TYPES.includes(userType)) {
    return <NotFound />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Request a new invitation</h1>
      <p className="mt-3 text-slate-600">
        This older invitation link cannot activate an account. Ask your school admin to
        send a new invitation, then use the link in that email to set your password.
      </p>
      <Link href="/login" className="mt-5 underline">
        Return to sign in
      </Link>
    </main>
  )
}
