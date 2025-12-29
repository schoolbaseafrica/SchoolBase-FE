import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  logoutFrom?: string
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  logoutFrom = "SchoolBase",
}: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError(null)

    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      setError("A network error occured. Please check your connection and try again")
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    if (!isLoggingOut) {
      setError(null)
      onOpenChange(false)
    }
  }

  const handleTryAgain = () => {
    setError(null)
  }

  // Loading state
  if (isLoggingOut) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 border-0 p-0 sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center px-6 py-12">
            <div className="relative mb-4 h-12 w-12">
              <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
            <p className="text-base font-normal text-gray-700">Logging Out</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 border-0 p-0 sm:max-w-[425px]">
          <DialogHeader className="space-y-3 px-6 pt-8 pb-6">
            <DialogTitle className="text-center text-2xl font-semibold">
              Log Out Failed
            </DialogTitle>
            <DialogDescription className="text-center text-base text-gray-600">
              {error}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 border-t">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="h-14 rounded-none border-r text-base font-normal hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={handleTryAgain}
              className="h-14 rounded-none text-base font-normal text-red-500 hover:bg-gray-50 hover:text-red-600"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Default confirmation state
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 border-0 p-0 sm:max-w-[425px]">
        <DialogHeader className="space-y-3 px-6 pt-8 pb-6">
          <DialogTitle className="text-center text-2xl font-semibold">
            Log Out?
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            You&apos;ll log out from {logoutFrom}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 border-t">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="h-14 rounded-none border-r text-base font-normal hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="h-14 rounded-none text-base font-normal text-red-500 hover:bg-gray-50 hover:text-red-600"
          >
            Log out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
