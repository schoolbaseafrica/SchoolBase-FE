"use client"

import React, { useState } from "react"
import Link from "next/link"
import { AlertCircle, MailCheck, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth"
import { sendForgotPasswordEmail } from "@/lib/api/auth"
import SchoolLogo from "./school-logo"

const AUTH_SECTION_STYLES =
  "flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8"
const BUTTON_STYLES = "w-full disabled:-cursor-not-allowed disabled:opacity-100"

const initialValues: ForgotPasswordFormValues = { email: "" }

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState(initialValues)
  const [error, setError] = useState<string | undefined>(undefined)
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const getEmailError = (value: string) => {
    const schema = forgotPasswordSchema.shape.email
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData({ email: value })

    if (touched) {
      setError(getEmailError(value))
    }
  }

  const handleBlur = () => {
    if (!touched) setTouched(true)
    setError(getEmailError(formData.email))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)

    // Validate with Zod
    const validation = forgotPasswordSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.flatten().fieldErrors.email?.[0])
      return
    }

    setIsSubmitting(true)
    setError(undefined)

    try {
      await sendForgotPasswordEmail(validation.data.email)
      setIsSubmitted(true)
    } catch {
      setError("Failed to send reset link. Please try again later.")
      setIsSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={AUTH_SECTION_STYLES}>
      <SchoolLogo />

      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            {isSubmitted ? "Check your inbox" : "Forgot Password"}
          </h1>
          <p className="text-sm text-gray-600">
            {isSubmitted
              ? `If the account exists, password reset instructions will be sent to ${formData.email}.`
              : "Enter the email address associated with your account and we will send a reset link."}
          </p>
        </header>

        {isSubmitted ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <MailCheck className="h-8 w-8" />
            </div>

            <Button asChild className={BUTTON_STYLES}>
              <Link href="/login">Back to Login</Link>
            </Button>

            <p className="text-sm text-gray-600">
              Didn&apos;t receive the email? Check your spam folder or try again later.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>

              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@school.edu"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched && error)}
                  className={`w-full ${
                    error && touched ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />

                {touched && error && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className={BUTTON_STYLES}>
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-[#DA3743] hover:text-[#C32F3A]">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
