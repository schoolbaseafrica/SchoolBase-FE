"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertCircle, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth"
import { useRouter } from "next/navigation"
import SchoolLogo from "../../_components/school-logo"
import { SetupWizardAPI } from "@/lib/api/setup/super-admin-setup-apis"

type LoginField = keyof LoginFormValues

const initialValues: LoginFormValues = {
  email: "",
  password: "",
}

const SuperAdminLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({})
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({
    email: false,
    password: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showLockedModal, setShowLockedModal] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const nextRoute =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("next")

  const router = useRouter()

  const getFieldError = (field: LoginField, value: string) => {
    const schema = loginSchema.shape[field]
    if (!schema) return undefined
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const syncFieldError = (field: LoginField, value: string) => {
    const message = getFieldError(field, value)
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const field = name as LoginField
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (touched[field]) {
      syncFieldError(field, value)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as LoginField
    setTouched((prev) => ({ ...prev, [field]: true }))
    syncFieldError(field, formData[field])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Check if account is locked
    if (isLocked) {
      setShowLockedModal(true)
      return
    }

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    })

    // Validate form data
    const validation = loginSchema.safeParse(formData)
    if (!validation.success) {
      const { fieldErrors } = validation.error.flatten()
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await SetupWizardAPI.login(formData)

      if (nextRoute) {
        router.push(nextRoute)
        setAttemptCount(0)
        return
      }
      router.push(`/super-admin`)
      setAttemptCount(0)
    } catch (error) {
      console.error("Login error:", error)

      // Increment attempt count
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // Show warning after 3 attempts
      if (newAttemptCount === 3) {
        setShowWarningModal(true)
      }

      // Lock account after 5 attempts
      if (newAttemptCount >= 5) {
        setIsLocked(true)
        setShowLockedModal(true)
      }

      // Set error message
      setErrors({
        password:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const renderError = (field: LoginField) => {
    if (!touched[field] || !errors[field]) return null
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{errors[field]}</span>
      </div>
    )
  }

  return (
    <>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8">
        {/* School Logo */}
        <SchoolLogo />

        {/* Main Content */}
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-600">Sign in your account to continue</p>
          </header>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <div className="mt-2">
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="admin@school.edu"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  aria-invalid={touched.email && Boolean(errors.email)}
                  className={`w-full ${
                    errors.email && touched.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                />
                {renderError("email")}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  aria-invalid={touched.password && Boolean(errors.password)}
                  className={`w-full pr-10 ${
                    errors.password && touched.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Image
                      src="/assets/images/auth/show-password-icon.png"
                      alt=""
                      width={16}
                      height={16}
                    />
                  ) : (
                    <Image
                      src="/assets/images/auth/hide-password-icon.png"
                      alt=""
                      width={16}
                      height={16}
                    />
                  )}
                </button>
              </div>
              {renderError("password")}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={isLoading}
                  className="accent-accent h-4 w-4 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className={`ml-2 block text-sm text-gray-900 ${
                    isLoading ? "opacity-50" : ""
                  }`}
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className={`text-accent font-medium hover:underline ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2Icon className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Warning Modal - After 3 attempts */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <Image
                src="/assets/images/auth/desktop-school-logo.png"
                alt="School Logo"
                width={60}
                height={60}
              />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Attention
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              You have 5 attempts to enter a correct password before your account is
              locked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={() => setShowWarningModal(false)} className="w-full">
              Try again
            </Button>
            <Link href="/forgot-password" className="w-full">
              <Button variant="outline" className="w-full">
                Forgot Password
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Locked Out Modal - After 5 attempts */}
      <Dialog open={showLockedModal} onOpenChange={setShowLockedModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <Image
                src="/assets/images/auth/desktop-school-logo.png"
                alt="School Logo"
                width={60}
                height={60}
              />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Locked out
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your account has been locked due to multiple incorrect password attempts.
              You can reset your password now or try again in 01:59:59 hours
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full bg-[#DA3743] text-white hover:bg-[#C32F3A]">
                Forgot Password
              </Button>
            </Link>
            <Button
              onClick={() => setShowLockedModal(false)}
              variant="outline"
              className="w-full border border-[#DA3743] bg-white text-[#DA3743] hover:bg-red-50"
            >
              Sign in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SuperAdminLoginForm
