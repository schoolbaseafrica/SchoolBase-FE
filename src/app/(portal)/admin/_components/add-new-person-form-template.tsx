import React, { useState, ChangeEvent, FormEvent } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "file"
  | "password-generate"

export interface FormField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  generateButton?: {
    text: string
    onGenerate: () => string
  }
  accept?: string
  pattern?: string
  readonly?: boolean
  disabled?: boolean
  buttonText?: string
  validation?: {
    pattern?: RegExp
    message?: string
    validate?: (value: string) => string | null
  }
  minAge?: number
}

export interface NewPersonFormConfig {
  fields: FormField[]
  submitText: string
  cancelText?: string
}

interface FormBuilderProps {
  config: NewPersonFormConfig
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  initialData?: Record<string, unknown>
  isEditMode?: boolean
}

interface FieldErrors {
  [key: string]: string
}

export const NewPersonFormBuilder: React.FC<FormBuilderProps> = ({
  config,
  onCancel,
  onSubmit,
  initialData,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    if (initialData) return initialData

    const emptyState: Record<string, unknown> = {}
    config.fields.forEach((field) => (emptyState[field.name] = ""))
    return emptyState
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^[\d\s+\-()]+$/
    if (!phoneRegex.test(phone)) {
      return "Phone number can only contain numbers, spaces, +, -, and ()"
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return "Phone number must be at least 10 digits"
    }
    return null
  }

  const validateField = (name: string, value: string): string | null => {
    const field = config.fields.find((f) => f.name === name)

    if (!value && field?.required) {
      return "This field is required"
    }

    // ✅ AGE VALIDATION (Teacher & Parent only)
    if (field?.type === "date" && field?.minAge) {
      const dob = new Date(value)
      const today = new Date()

      let age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
      }

      if (age < field.minAge) {
        return `Must be at least ${field.minAge} years old`
      }
    }

    switch (name) {
      case "email":
        return validateEmail(value)
      case "phone":
      case "phoneNumber":
      case "phone":
        return validatePhone(value)
      default:
        return null
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field error when user starts typing
    // if (fieldErrors[name]) {
    //   setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    // }

    // Validate on change for immediate feedback
    const error = validateField(name, value)
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [name]: error }))
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }

    setLocalError("")
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]

    if (file) {
      const previewUrl = URL.createObjectURL(file)

      setFormData((prev) => ({
        ...prev,
        [fieldName]: {
          file,
          previewUrl,
        },
      }))
    }
  }

  const handleGenerate = (fieldName: string, generator: () => string) => {
    const generated = generator()
    setFormData((prev) => ({ ...prev, [fieldName]: generated }))
  }

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    config.fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = "This field is required"
        isValid = false
      } else if (formData[field.name] && typeof formData[field.name] === "string") {
        const error = validateField(field.name, formData[field.name] as string)
        if (error) {
          errors[field.name] = error
          isValid = false
        }
      }
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setLocalError("Please fix the validation errors before submitting.")
      return
    }

    setIsSubmitting(true)
    setLocalError("")

    try {
      await onSubmit(formData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong."
      setLocalError(errorMessage)

      // Don't clear form on error to prevent duplicate submissions
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const commonInputClasses =
      "w-full rounded-lg shadow-sm border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none focus:border-transparent transition-all readonly:cursor-not-allowed readonly:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"

    const hasError = fieldErrors[field.name]
    const inputClasses = cn(
      commonInputClasses,
      hasError && "border-red-500 focus:ring-red-500"
    )

    // Helper to apply disabled style + attribute
    const isEmailField = field.name === "email"

    const disabled = isEditMode && isEmailField

    const maxDate =
      field.minAge !== undefined
        ? (() => {
            const d = new Date()
            d.setFullYear(d.getFullYear() - field.minAge)
            return d.toISOString().split("T")[0]
          })()
        : undefined

    switch (field.type) {
      case "select":
        return (
          <div>
            <Select
              value={formData[field.name] as string}
              required={field.required}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, [field.name]: value }))
                if (fieldErrors[field.name]) {
                  setFieldErrors((prev) => ({ ...prev, [field.name]: "" }))
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full rounded-lg border-gray-300 shadow-sm",
                  hasError && "border-red-500"
                )}
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
          </div>
        )

      case "date":
        return (
          <div>
            <div className="relative">
              <input
                type="date"
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name] as string}
                onChange={handleChange}
                max={maxDate}
                className={cn(inputClasses, "before:hidden after:hidden")}
              />
              <div className="absolute top-1/2 right-px -translate-y-1/2 bg-white pr-3">
                <Calendar className="pointer-events-none h-5 w-5 text-gray-400" />
              </div>
            </div>
            {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
          </div>
        )

      case "file":
        const fileData = formData[field.name] as
          | { file: File; previewUrl: string }
          | undefined
        return (
          <div>
            <input
              type="file"
              id={field.name}
              name={field.name}
              required={field.required}
              accept={field.accept}
              onChange={(e) => handleFileChange(e, field.name)}
              className="hidden"
            />

            <label
              htmlFor={field.name}
              className="inline-block cursor-pointer rounded-lg border-2 border-red-600 px-6 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              {field.buttonText || "Select file"}
            </label>

            {/* File name */}
            {fileData?.file && (
              <span className="ml-3 text-sm text-gray-600">{fileData.file.name}</span>
            )}

            {/* Image Preview */}
            {fileData?.previewUrl && (
              <div className="mt-3">
                <Image
                  src={fileData.previewUrl}
                  width={150}
                  height={150}
                  alt="Preview"
                  className="h-24 w-24 rounded-md border object-cover"
                />
              </div>
            )}
          </div>
        )

      case "password-generate":
        const isPasswordDisabled = isEditMode
        return (
          <div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 pr-2 shadow-sm">
              <input
                type="text"
                id={field.name}
                name={field.name}
                required={!isEditMode && field.required} // Don't require in edit mode
                value={formData[field.name] as string}
                onChange={handleChange}
                placeholder={
                  isEditMode ? "Password cannot be changed" : field.placeholder
                }
                className={cn(
                  commonInputClasses,
                  "border-none shadow-none",
                  hasError && "border-red-500",
                  isPasswordDisabled && "cursor-not-allowed bg-gray-100"
                )}
                disabled={isPasswordDisabled}
                readOnly={isPasswordDisabled}
              />
              <Button
                type="button"
                onClick={() =>
                  !isPasswordDisabled &&
                  field.generateButton &&
                  handleGenerate(field.name, field.generateButton.onGenerate)
                }
                size="sm"
                className="w-auto px-6 text-sm whitespace-nowrap"
                disabled={isPasswordDisabled}
              >
                {field.generateButton?.text || "Generate"}
              </Button>
            </div>
            {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
            {isEditMode && (
              <p className="mt-1 text-sm text-gray-500">
                Password cannot be changed in edit mode
              </p>
            )}
          </div>
        )

      default:
        return (
          <div>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              required={field.required}
              value={formData[field.name] as string}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={inputClasses}
              pattern={field.pattern}
              disabled={field.disabled || disabled}
              readOnly={field.readonly || disabled}
            />
            {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
          </div>
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {localError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 gap-x-8 lg:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.name} className={field.type === "file" ? "lg:col-span-2" : ""}>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              {field.label}{" "}
              {field.required ? <span className="text-red-600">*</span> : <></>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 pt-4 md:justify-end">
        {config.cancelText && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="px-12">
            {config.cancelText}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="px-12">
          {isSubmitting ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            config.submitText
          )}
        </Button>
      </div>
    </form>
  )
}
