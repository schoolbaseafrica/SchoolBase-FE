// path is /[userType]/[userID]

import InvitedUserActivateProps, {
  InvitedUserType,
} from "@/app/(auth)/_components/invited-user-activate"
import NotFound from "@/app/not-found"

const ALLOWED_TYPES = ["teachers", "students", "parents"]

export default async function InvitedUserActivatePropsPage({
  params,
}: {
  params: Promise<{ userType: InvitedUserType; inviteID: string }>
}) {
  const { userType, inviteID } = await params

  // if not expected userType redirect to actual 404 page
  if (!ALLOWED_TYPES.includes(userType)) {
    return <NotFound />
  }

  return <InvitedUserActivateProps userType={userType} inviteID={inviteID} />
}
