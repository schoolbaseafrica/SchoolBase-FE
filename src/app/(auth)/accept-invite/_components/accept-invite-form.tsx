"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoveRight } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth"
import { InvitesAPI } from "@/lib/invites"
import SchoolLogo from "../../_components/school-logo"

type ResetField = keyof ResetPasswordFormValues

const initialValues: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
}

interface AcceptInviteFormProps {
  token: string
}

const AcceptInviteForm: React.FC<AcceptInviteFormProps> = ({ token }) => {
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
  const [error, setError] = useState<string | null>(null)

  const validateField = (field: ResetField, candidate: ResetPasswordFormValues) => {
    const result = resetPasswordSchema.safeParse(candidate)
    if (result.success) return undefined
    return result.error.flatten().fieldErrors[field]?.[0]
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const field = name as ResetField
    const updated = { ...formData, [field]: value }
    setFormData(updated)

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, updated) }))
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
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    setError(null)

    try {
      await InvitesAPI.acceptInvite({
        token,
        password: formData.newPassword,
      })
      setIsSuccess(true)
    } catch (err) {
      console.error("Invite acceptance failed:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to accept invitation. Please try again or contact support.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors =
    !formData.newPassword ||
    !formData.confirmPassword ||
    !!errors.newPassword ||
    !!errors.confirmPassword

  return (
    <section className="flex min-h-screen w-full justify-center overflow-x-hidden bg-white">
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20">
        <SchoolLogo />

        {error && (
          <div className="mb-6 w-full max-w-[464px] rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
              <h1 className="mb-2 text-center text-[28px] font-bold text-[var(--text-primary)]">
                Accept Invitation
              </h1>
              <p className="mb-8 text-center text-sm text-[var(--text-secondary)]">
                You&apos;ve been invited to join. Create your password to activate your account.
              </p>

              <form onSubmit={handleSubmit} autoComplete="on">
                {(["newPassword", "confirmPassword"] as ResetField[]).map((field) => (
                  <div key={field} className="mb-6">
                    <label
                      htmlFor={field}
                      className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                    >
                      {field === "newPassword"
                        ? "Create Password"
                        : "Confirm Password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={
                          field === "newPassword"
                            ? showNewPassword
                              ? "text"
                              : "password"
                            : showConfirmPassword
                              ? "text"
                              : "password"
                        }
                        name={field}
                        id={field}
                        autoComplete="new-password"
                        placeholder="••••••"
                        value={formData[field]}
                        onChange={handlePasswordChange}
                        onBlur={handleBlur}
                        className={`pr-12 ${
                          touched[field] && errors[field]
                            ? "border-[var(--accent)]"
                            : "border-[#E0E0E0] focus:border-[var(--text-primary)]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          field === "newPassword"
                            ? setShowNewPassword((s) => !s)
                            : setShowConfirmPassword((s) => !s)
                        }
                        className="absolute top-1/2 right-4 -translate-y-1/2"
                      >
                        <Image
                          src={
                            field === "newPassword"
                              ? showNewPassword
                                ? "/assets/images/auth/show-password-icon.png"
                                : "/assets/images/auth/hide-password-icon.png"
                              : showConfirmPassword
                                ? "/assets/images/auth/show-password-icon.png"
                                : "/assets/images/auth/hide-password-icon.png"
                          }
                          alt="Toggle"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                    {touched[field] && errors[field] && (
                      <p className="mt-2 flex items-start gap-2 text-xs text-[var(--accent)]">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--accent)] text-[10px] font-bold">
                          !
                        </span>
                        {errors[field]}
                      </p>
                    )}
                  </div>
                ))}

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
                  {isSubmitting ? "Creating Account..." : "Accept Invitation"}
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
              className="flex w-full max-w-[464px] flex-col items-center text-center"
            >
              <div className="mb-8">
                <Image
                  src="/assets/images/invited-user/vector.png"
                  alt="Success"
                  width={150}
                  height={150}
                />
              </div>

              <h1 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
                Account Created Successfully!
              </h1>

              <p className="mb-8 text-sm text-[var(--text-secondary)]">
                Your account has been activated. You can now log in to access your school portal.
              </p>

              <Button asChild className="w-full py-3 text-[16px] font-semibold">
                <Link href="/login">Go to Login</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default AcceptInviteForm
