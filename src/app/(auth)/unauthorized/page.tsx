"use client"

import { AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleLogout = () => {
    // Optional: clear cookies or session here if needed
    router.push("/login")
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <AlertCircle className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Unauthorized Access</h2>
        <p className="mb-6 text-gray-600">
          You do not have permission to view this page.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
          <Button onClick={handleLogout} className="w-full" variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Troubleshooting Tips
            </summary>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>• Ensure you are logged in with the correct account.</li>
              <li>• Verify your account has permission to access this page.</li>
              <li>• Contact the administrator if you believe this is an error.</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  )
}
