"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useParentAuth } from "@/hooks/use-auth-user"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ParentRouteGuard({ children }: { children: React.ReactNode }) {
  const { isParent, isLoading, error } = useParentAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Skip auth check for auto-login page
  const isAutoLoginPage = pathname === "/parent/auto-login"

  useEffect(() => {
    // Skip redirect for auto-login page
    if (isAutoLoginPage) {
      return
    }

    // If auth check is complete and user is not a parent, redirect to dashboard
    if (!isLoading && !isParent && !error) {
      router.push("/dashboard")
    }
  }, [isLoading, isParent, error, router, isAutoLoginPage])

  // Skip guard for auto-login page
  if (isAutoLoginPage) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Authentication Error
              </CardTitle>
              <CardDescription>
                There was an error verifying your authentication status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || "Failed to verify authentication"}
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-4">
                <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If user is not a parent, show access denied message
  if (!isParent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldX className="h-5 w-5 text-red-500" />
                Access Denied
              </CardTitle>
              <CardDescription>
                This area is restricted to parent accounts only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Restricted</AlertTitle>
                <AlertDescription>
                  You don't have permission to access the parent portal. This section is
                  only available to users with a parent account.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button onClick={() => router.push("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // User is a parent, render children
  return <>{children}</>
}
