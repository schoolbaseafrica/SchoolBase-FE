import React, { useState, useMemo } from "react"
import { z } from "zod"
import ProgressIndicator from "./progress-indicator"
import { FormField } from "@/components/ui/form-field"
import { Errors, FormData } from "../_types/setup"
import { Button } from "@/components/ui/button"
import { EyeClosedIcon, EyeIcon } from "lucide-react"

interface PasswordRequirementProps {
  met: boolean
  text: string
  requirementActive?: boolean
}

interface AdminAccountFormProps {
  formData: FormData
  updateFormData: (section: keyof FormData, field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

const adminSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password must not exceed 20 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function AdminAccountForm({
  formData,
  updateFormData,
  onSubmit,
  onCancel,
}: AdminAccountFormProps) {
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)

  const passwordStrength = useMemo(() => {
    const pwd = formData.admin.password
    return {
      length: pwd.length >= 6 && pwd.length <= 20,
      special:
        /[a-zA-Z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    }
  }, [formData.admin.password])

  function handleChange(section: keyof FormData, field: string, value: string) {
    updateFormData(section, field, value)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // if(formData.admin.confirmPassword && formData.admin.password !== formData.admin.confirmPassword){
    //   setErrors((prev) => {
    //     ...prev,
    //     "confirmPassword": "It is not the same as your password"
    //   })
    // }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = adminSchema.safeParse(formData.admin)

    if (!result.success) {
      const newErrors: Errors = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(newErrors)
    } else {
      setErrors({})
      onSubmit()
    }
  }

  return (
    <form className="p-2 md:p-12" onSubmit={handleSubmit}>
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">
        Create Superadmin Account
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Set up your super administrator account
      </p>

      <ProgressIndicator key="progress" currentStep={3} />

      <div className="animate-onrender mb-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="First Name"
            required
            error={errors.firstName}
            value={formData.admin.firstName}
            onChange={(e) => handleChange("admin", "firstName", e.target.value)}
            placeholder="Enter First Name"
          />
          <FormField
            label="Last Name"
            required
            error={errors.lastName}
            value={formData.admin.lastName}
            onChange={(e) => handleChange("admin", "lastName", e.target.value)}
            placeholder="Enter Last Name"
          />
        </div>

        <FormField
          label="Email Address"
          required
          type="email"
          error={errors.email}
          value={formData.admin.email}
          onChange={(e) => handleChange("admin", "email", e.target.value)}
          placeholder="email@example.com"
        />

        <FormField
          label="Password"
          required
          type={showPassword ? "text" : "password"}
          error={errors.password}
          value={formData.admin.password}
          onChange={(e) => handleChange("admin", "password", e.target.value)}
          placeholder="Create a strong password"
        >
          <div
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer md:right-4"
            role="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => {
              setShowPassword((a) => !a)
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                setShowPassword((a) => !a)
              }
            }}
          >
            {showPassword ? (
              <EyeClosedIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </div>
        </FormField>

        <FormField
          label="Confirm Password"
          required
          type={showPassword ? "" : "password"}
          error={errors.confirmPassword}
          value={formData.admin.confirmPassword}
          onChange={(e) => handleChange("admin", "confirmPassword", e.target.value)}
          placeholder="Confirm your password"
        />

        {/* Password Strength Indicators */}
        <div className="space-y-2 text-sm">
          <PasswordRequirement
            requirementActive={!!formData.admin.password}
            met={passwordStrength.length}
            text="6 characters (20 max)"
          />
          <PasswordRequirement
            requirementActive={!!formData.admin.password}
            met={passwordStrength.special}
            text="1 letter, 1 number, 1 special character (# ? ! @)"
          />
          <PasswordRequirement
            requirementActive={!!formData.admin.password}
            met={passwordStrength.length && passwordStrength.special}
            text="Strong password"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2 md:grid-cols-2 md:gap-4">
        <Button onClick={onCancel} variant="outline" className="px-4 py-3">
          Back
        </Button>
        <Button type="submit" className="px-4 py-3">
          Submit & Continue
        </Button>
      </div>
    </form>
  )
}

function PasswordRequirement({ met, text, requirementActive }: PasswordRequirementProps) {
  const color = requirementActive
    ? met
      ? "text-green-500"
      : "text-red-500"
    : "text-gray-400"
  return (
    <div className="flex items-center gap-2">
      <span className={color}>•</span>
      <span className={color}>{text}</span>
    </div>
  )
}
