import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
        <DialogContent className="z-[200] max-w-md border-4 border-orange-400 bg-white shadow-2xl ring-4 ring-orange-200">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <TriangleAlertIcon className="h-20 w-20 text-orange-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              No Active Session Found
            </DialogTitle>
            <DialogDescription className="text-center text-base font-medium text-gray-800">
              You need to create an active academic session before you can create classes,
              assign subjects, or perform other academic operations. An active session
              (e.g., 2025/2026) is required to organize your academic activities.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              asChild
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              <Link href={LINK_TO_ACTIVE_SESSIONS}>Create an Active Session</Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
