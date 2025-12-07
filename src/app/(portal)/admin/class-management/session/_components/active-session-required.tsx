import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog"
import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { useActiveAcademicSession } from "../_hooks/use-session"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"

const LINK_TO_ACTIVE_SESSIONS = "/admin/class-management/session/create-session"
// const LINK_TO_SUBJECTS_LIST = "/admin/class-management/subjects"

export default function ActiveSessionGuard({ children }: { children?: ReactNode }) {
  const { data: currentSession, isLoading: isLoadingSession } = useActiveAcademicSession()
  const router = useRouter()
  // active session here means school session e.g 2035/2036 session

  const handleClose = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <>
      {children}
      <Dialog open={!isLoadingSession && !currentSession} onOpenChange={handleClose}>
        <DialogOverlay className="z-60" />
        <DialogContent className="z-60 max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <TriangleAlertIcon className="h-20 w-20 text-orange-400" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              No Active Session Found
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Please create an active academic session to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full">
              <Link href={LINK_TO_ACTIVE_SESSIONS}>Create an Active Session</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
