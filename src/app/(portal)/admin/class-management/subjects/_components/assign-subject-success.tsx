import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface AssignSubjectSuccessProps {
  open: boolean
  setOpen: (open: boolean) => void
  onGoHome: () => void
}

export default function AssignSubjectSuccess({
  open,
  setOpen,
  onGoHome,
}: AssignSubjectSuccessProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
            Subject Assignments Updated
          </DialogTitle>
          <DialogDescription className="text-text-secondary mb-6 text-sm">
            The subject assignments have been successfully updated.
          </DialogDescription>
          <Button onClick={handleGoHome} className="w-full">
            Go Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  function handleGoHome() {
    setOpen(false)
    onGoHome()
  }
}
