"use client"

import React, { useState } from "react"
import { AlertCircle, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SchoolLogo from "../../_components/school-logo"
import { loginUsingEmail } from "@/lib/api/auth"
import z from "zod"
import { useRouter } from "next/navigation"

export const activationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type ActivationFormValues = z.infer<typeof activationSchema>
type ActivationField = keyof ActivationFormValues

const initialValues: ActivationFormValues = {
  email: "",
  password: "",
}

const ActivationForm = () => {
  const [formData, setFormData] = useState<ActivationFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<ActivationField, string>>>({})
  const [touched, setTouched] = useState<Record<ActivationField, boolean>>({
    email: false,
    password: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 lg:px-8">
      {/* School Logo */}
      <SchoolLogo />

      {/* Main Content */}
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Activate Your School Portal
          </h1>
          <p className="text-sm text-gray-600">
            Enter your installation key to unlock setup
          </p>
        </header>

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Admin Email <span className="text-red-600">*</span>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password <span className="text-red-600">*</span>
            </label>
            <div className="mt-2">
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                aria-invalid={touched.password && Boolean(errors.password)}
                className={`w-full ${
                  errors.password && touched.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
              />
              {renderError("password")}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2Icon className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "Verify"
            )}
          </Button>
        </form>
      </div>
    </section>
  )

  function getFieldError(field: ActivationField, value: string) {
    const schema = activationSchema.shape[field]
    if (!schema) return undefined
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  function syncFieldError(field: ActivationField, value: string) {
    const message = getFieldError(field, value)
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const field = name as ActivationField
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (touched[field]) {
      syncFieldError(field, value)
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const field = event.target.name as ActivationField
    setTouched((prev) => ({ ...prev, [field]: true }))
    syncFieldError(field, formData[field])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    })

    // Validate form data
    const validation = activationSchema.safeParse(formData)
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
      await loginUsingEmail(formData)
      router.push("/login")
    } catch (error) {
      console.error("Activation error:", error)

      // Set appropriate error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes("email")) {
          setErrors({ email: "Invalid Email Address" })
        } else if (error.message.includes("password")) {
          setErrors({ password: "Incorrect Password" })
        } else {
          setErrors({ password: "Activation failed. Please try again." })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  function renderError(field: ActivationField) {
    if (!touched[field] || !errors[field]) return null
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{errors[field]}</span>
      </div>
    )
  }
}

export default ActivationForm
