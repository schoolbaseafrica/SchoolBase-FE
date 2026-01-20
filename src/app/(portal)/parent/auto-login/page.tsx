"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParentAccessLinksAPI } from "@/lib/api/parent-access-links"
import { sendResetPasswordRequest } from "@/lib/api/auth"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

export default function ParentAutoLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "password_reset">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  
  // Password reset form state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [isResetting, setIsResetting] = useState(false)
  const hasValidatedRef = useRef(false) // Prevent multiple validations
  const isPasswordResetModeRef = useRef(false) // Track if we're in password reset mode

  useEffect(() => {
    // Prevent re-validation if we've already validated or are in password reset mode
    if (hasValidatedRef.current || isPasswordResetModeRef.current) {
      return
    }

    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setErrorMessage("No access token provided in the link")
      return
    }

    setMagicLinkToken(token)
    hasValidatedRef.current = true // Mark as validated
    validateLink(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]) // Only depend on searchParams

  const validateLink = async (token: string) => {
    try {
      console.log("[Auto-login] Starting validation with token:", token.substring(0, 10) + "...")
      
      // Clear any existing auth state
      clearAuth()
      queryClient.clear()

      console.log("[Auto-login] Calling validate API...")
      const response = await ParentAccessLinksAPI.validate(token)
      console.log("[Auto-login] Validate response:", response)

      if (response.data) {
        // Check if password reset is required
        if (response.data.requires_password_reset && response.data.reset_token) {
          console.log("[Auto-login] Password reset required")
          setResetToken(response.data.reset_token)
          setUserName(`${response.data.user.first_name} ${response.data.user.last_name}`)
          isPasswordResetModeRef.current = true // Mark as in password reset mode
          setStatus("password_reset")
          return
        }

        // Password already reset or not required - proceed with auto-login
        console.log("[Auto-login] Validation successful, cookies should be set in response")
        setStatus("success")

        // Redirect to parent portal
        setTimeout(() => {
          console.log("[Auto-login] Redirecting to parent dashboard...")
          window.location.replace("/parent")
        }, 2000)
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setPasswordErrors({})

    // Validate passwords
    const errors: { newPassword?: string; confirmPassword?: string } = {}

    if (!newPassword) {
      errors.newPassword = "Password is required"
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = "Password must contain uppercase, lowercase, and number"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    if (!resetToken) {
      setPasswordErrors({ newPassword: "Reset token is missing. Please contact support." })
      return
    }

    setIsResetting(true)

    try {
      await sendResetPasswordRequest({
        token: resetToken,
        newPassword: newPassword,
      })

      toast.success("Password set successfully! Logging you in...")

      // After successful password reset, validate the magic link again to log in
      if (magicLinkToken) {
        // Reset the flags to allow re-validation after password reset
        isPasswordResetModeRef.current = false
        hasValidatedRef.current = false
        // Wait a moment for the backend to process the password reset
        setTimeout(async () => {
          await validateLink(magicLinkToken)
        }, 1000)
      }
    } catch (error) {
      console.error("Password reset error:", error)
      const message = error instanceof Error ? error.message : "Failed to set password. Please try again."
      setPasswordErrors({ newPassword: message })
      toast.error(message)
      setIsResetting(false)
    }
  }

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

  if (status === "password_reset") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Set Your Password
            </CardTitle>
            <CardDescription>
              Hello {userName}! Before accessing your parent portal, please set your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={passwordErrors.newPassword ? "border-red-500" : ""}
                    disabled={isResetting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isResetting}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                    disabled={isResetting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isResetting}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  "Set Password & Continue"
                )}
              </Button>
            </form>
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
