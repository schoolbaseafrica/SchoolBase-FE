"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoveRight } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth"
import SchoolLogo from "./school-logo"

type UserType = "teacher" | "parent" | "admin"
type ResetField = keyof ResetPasswordFormValues

type InvitedUserSignInProps = {
  userType: UserType
}

const initialValues: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
}

const InvitedUserSignIn: React.FC<InvitedUserSignInProps> = ({ userType }) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email)

  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<ResetField, string>>>({})
  const [touched, setTouched] = useState<Record<ResetField, boolean>>({
    newPassword: false,
    confirmPassword: false,
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name as ResetField
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData) }))
  }

  const handleSubmitStep1 = (e: React.FormEvent) => {
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

    if (!isValidEmail) {
      setEmailTouched(true)
      return
    }

    setStep(2)
  }

  const getUserLabel = () => {
    switch (userType) {
      case "teacher":
        return "Teacher"
      case "parent":
        return "Parent"
      case "admin":
        return "Admin"
      default:
        return ""
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto px-4 sm:px-8 lg:px-12 xl:px-20">
      <SchoolLogo />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[464px]"
          >
            <h1 className="mb-2 text-center text-[28px] font-bold text-[var(--text-primary)]">
              Welcome!
            </h1>
            <p className="mb-8 text-center text-sm text-[var(--text-secondary)]">
              You&apos;ve been invited as a{" "}
              <span className="font-bold">{getUserLabel()}</span>. Finish setup to enter
              your school portal.
            </p>

            <form onSubmit={handleSubmitStep1} autoComplete="on">
              {/* EMAIL */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Email Address
                </label>

                <Input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="jamesjackendfornd@gmail.com"
                  className={`w-full border-2 ${
                    emailTouched && !isValidEmail
                      ? "border-red-500 bg-red-50"
                      : "border-gray-400"
                  }`}
                />

                {emailTouched && !isValidEmail && (
                  <p className="mt-1 text-sm text-[var(--accent)]">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              {(["newPassword", "confirmPassword"] as ResetField[]).map((field) => (
                <div key={field} className="mb-6">
                  <label
                    htmlFor={field}
                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                  >
                    {field === "newPassword"
                      ? "Enter New Password"
                      : "Confirm New Password"}
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
                      className={`w-full pr-10 border-2 ${
                        touched[field] && errors[field]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        field === "newPassword"
                          ? setShowNewPassword((s) => !s)
                          : setShowConfirmPassword((s) => !s)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                      aria-label={
                        (field === "newPassword" ? showNewPassword : showConfirmPassword)
                          ? "Hide password"
                          : "Show password"
                      }
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
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                  {touched[field] && errors[field] && (
                    <p className="mt-1 text-sm text-[var(--accent)]">{errors[field]}</p>
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full py-3 text-[16px] font-semibold">
                Create Account <MoveRight />
              </Button>
            </form>
          </motion.div>
        )}

        {/* STEP 2 SUCCESS */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.4 }}
            className="flex w-full max-w-[464px] flex-col items-center text-center"
          >
            <div className="order-1 mb-8 md:order-3">
              <Image
                src="/assets/images/invited-user/vector.png"
                alt="Success"
                width={150}
                height={150}
              />
            </div>

            <h1 className="order-2 mb-4 text-2xl font-bold text-[#2D2D2D] md:order-1">
              Your Account Has Been Created Successfully!
            </h1>

            <p className="order-3 mb-8 text-sm text-[#6B6B6B] md:order-2">
              Account has been activated successfully.
            </p>

            <Button
              asChild
              className="order-4 w-full py-3 text-[16px] font-semibold md:order-4"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InvitedUserSignIn
