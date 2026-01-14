"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ParentAccessLinksAPI } from "@/lib/api/parent-access-links"
import { loginUsingEmail } from "@/lib/api/auth"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth-store"

export default function ParentAutoLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setErrorMessage("No access token provided in the link")
      return
    }

    // Validate and use the access link
    const validateLink = async () => {
      try {
        // Clear any existing auth state
        clearAuth()
        queryClient.clear()

        const response = await ParentAccessLinksAPI.validate(token)

        if (response.data) {
          // Set cookies via Next.js API route (similar to login)
          // We'll create a special endpoint for this
          const loginResponse = await fetch("/api/auth/auto-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: response.data.access_token,
              refresh_token: response.data.refresh_token,
              session_id: response.data.session_id,
              session_expires_at: response.data.session_expires_at,
              user: response.data.user,
            }),
          })

          if (!loginResponse.ok) {
            throw new Error("Failed to set authentication cookies")
          }

          setStatus("success")

          // Redirect to parent dashboard after a brief delay
          setTimeout(() => {
            router.push("/parent")
          }, 1500)
        }
      } catch (error) {
        console.error("Auto-login error:", error)
        setStatus("error")
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Invalid or expired access link. Please contact the administrator for a new link."
        )
      }
    }

    validateLink()
  }, [searchParams, router, queryClient, clearAuth])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Validating Access Link
            </CardTitle>
            <CardDescription>
              Please wait while we verify your access link...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-full animate-pulse bg-accent" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                This may take a few seconds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Access Link Invalid
            </CardTitle>
            <CardDescription>
              We couldn't validate your access link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login Page
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Access Granted
          </CardTitle>
          <CardDescription>
            You're being redirected to your parent portal...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we redirect you
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
