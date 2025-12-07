"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

import PasswordResetSuccess from "./password-reset-success"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoveRight } from "lucide-react"

import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth"

import { sendResetPasswordRequest } from "@/lib/api/auth"
import SchoolLogo from "./school-logo"

type ResetField = keyof ResetPasswordFormValues

const initialValues: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
}

const PasswordReset = () => {
  const searchParams = useSearchParams()

  const token = useMemo(() => {
    const t = searchParams.get("token")
    return t && t.trim() ? t : undefined
  }, [searchParams])

  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<ResetField, string>>>({})
  const [touched, setTouched] = useState<Record<ResetField, boolean>>({
    newPassword: false,
    confirmPassword: false,
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  /* ----------------------- VALIDATION (ZOD ONLY) ----------------------- */
  const validateField = (field: ResetField, candidate: ResetPasswordFormValues) => {
    const result = resetPasswordSchema.safeParse(candidate)
    if (result.success) return undefined
    return result.error.flatten().fieldErrors[field]?.[0]
  }

  /* ----------------------------- HANDLERS ----------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const field = name as ResetField

    const updated = { ...formData, [field]: value }
    setFormData(updated)

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, updated),
      }))
    }

    if (field === "newPassword" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", updated),
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name as ResetField

    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }))
    }

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData),
    }))
  }

  const hasErrors =
    !formData.newPassword ||
    !formData.confirmPassword ||
    !!errors.newPassword ||
    !!errors.confirmPassword

  /* --------------------------- FORM SUBMIT --------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setTokenError("The reset link is invalid or expired. Please request a new one.")
      return
    }

    const result = resetPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      })
      setTouched({ newPassword: true, confirmPassword: true })
      return
    }

    setIsSubmitting(true)
    setTokenError(null)

    try {
      await sendResetPasswordRequest({
        token,
        newPassword: formData.newPassword,
      })

      setIsSuccess(true)
    } catch (err) {
      console.error("Password reset failed:", err)
      if (err instanceof Error) {
        setTokenError(err.message)
      } else {
        setTokenError(
          "An unexpected error occured while resetting your password. Please try again later"
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ----------------------------- UI ----------------------------- */
  return (
    <section className="flex min-h-screen w-full justify-center overflow-x-hidden bg-white">
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20">
        {/* Logo */}
        <SchoolLogo />

        {/* TOKEN ERROR */}
        {tokenError && (
          <div className="mb-6 w-full max-w-[464px] rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {tokenError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[464px]"
            >
              <h1 className="mb-8 text-center text-[28px] font-bold text-[#2D2D2D]">
                Reset Password
              </h1>

              <form onSubmit={handleSubmit}>
                {/* NEW PASSWORD */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-[#2D2D2D]">
                    Enter New Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="••••••"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`pr-12 ${
                        touched.newPassword && errors.newPassword
                          ? "border-[#DA3743]"
                          : "border-[#E0E0E0] focus:border-[#2D2D2D]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((s) => !s)}
                      className="absolute top-1/2 right-4 -translate-y-1/2"
                    >
                      <Image
                        src={
                          showNewPassword
                            ? "/assets/images/auth/show-password-icon.png"
                            : "/assets/images/auth/hide-password-icon.png"
                        }
                        alt="Toggle"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>

                  {touched.newPassword && errors.newPassword && (
                    <p className="mt-2 flex items-start gap-2 text-xs text-[#DA3743]">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#DA3743] text-[10px] font-bold">
                        !
                      </span>
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-[#2D2D2D]">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`pr-12 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-[#DA3743]"
                          : "border-[#E0E0E0] focus:border-[#2D2D2D]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute top-1/2 right-4 -translate-y-1/2"
                    >
                      <Image
                        src={
                          showConfirmPassword
                            ? "/assets/images/auth/show-password-icon.png"
                            : "/assets/images/auth/hide-password-icon.png"
                        }
                        alt="Toggle"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>

                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-2 flex items-start gap-2 text-xs text-[#DA3743]">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#DA3743] text-[10px] font-bold">
                        !
                      </span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* REQUIREMENTS */}
                <ul className="mb-8 list-inside list-disc space-y-2 text-xs text-[#6B6B6B]">
                  <li>6 characters (20 max)</li>
                  <li>1 letter, 1 number, 1 special character (# ? ! @ $)</li>
                </ul>

                <Button
                  type="submit"
                  disabled={hasErrors || isSubmitting}
                  className="w-full py-3 text-[16px] font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Reset Password"}
                  <MoveRight />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[464px]"
            >
              <PasswordResetSuccess />

              <Button asChild className="mt-8 w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default PasswordReset
