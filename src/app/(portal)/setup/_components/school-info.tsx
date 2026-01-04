import React, { useMemo, useState } from "react"
import { UploadIcon } from "lucide-react"
import { z } from "zod"
import { Errors, FormData } from "../_types/setup"
import ProgressIndicator from "./progress-indicator"
import { FormField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getPhotoUrl } from "@/lib/api/utils/upload-photo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schoolSchema = z.object({
  name: z.string().min(2, "School name is required").max(120, "School name is too long"),
  phone: z.string().refine(
    (value) => {
      const cleaned = value.replace(/\s+/g, "")
      return /^\+234\d{10}$/.test(cleaned)
    },
    { message: "Phone number must be +234 followed by 10 digits" }
  ),
  address: z.string().min(5, "Address is required").max(200, "Address is too long"),
  brandColor: z.string(),
  logo: z.instanceof(File).nullable(),
})

interface SchoolInfoFormProps {
  formData: FormData
  updateFormData: (section: keyof FormData, field: string, value: string | File) => void
  onSubmit: () => void
  onCancel: () => void
}

export function SchoolInfoForm({
  formData,
  updateFormData,
  onSubmit,
  onCancel,
}: SchoolInfoFormProps) {
  const [errors, setErrors] = useState<Errors>({})
  const countryCodes = useMemo(() => ["+234"], [])
  const [countryCode, setCountryCode] = useState("+234")
  const phoneNumberValue = useMemo(() => {
    if (!formData.school.phone) return ""
    return formData.school.phone.replace("+234", "")
  }, [formData.school.phone])

  return (
    <form className="p-2 md:p-12" onSubmit={handleSubmit}>
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">
        School Information
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Add your school&apos;s branding and contact information
      </p>

      <ProgressIndicator key="progress" currentStep={1} />

      <div className="animate-onrender mb-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            School Logo (150x150 png)
          </label>

          <label className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50">
            {/* If image exists → show preview */}
            {formData.school.logoPreview ? (
              <Image
                width={150}
                height={150}
                src={formData.school.logoPreview}
                alt="School Logo Preview"
                className="absolute inset-0 h-full w-full object-contain p-2"
              />
            ) : (
              <>
                <UploadIcon className="text-accent mb-2 h-8 w-8" />
                <span className="text-sm text-gray-600">Drop files to upload</span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* File name */}
          {formData.school.logo && (
            <p className="mt-2 text-sm text-gray-600">{formData.school.logo.name}</p>
          )}
        </div>

        <FormField
          label="School Name"
          required
          error={errors.name}
          value={formData.school.name}
          onChange={(e) => handleChange("school", "name", e.target.value)}
          maxLength={120}
          placeholder="e.g. School Folio"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Primary Brand Color <span className="text-accent">*</span>
          </label>
          <div className="flex gap-3">
            <label className="h-11 w-16 cursor-pointer rounded-lg border border-gray-300 shadow-sm">
              <input
                type="color"
                value={formData.school.brandColor}
                onChange={(e) => handleChange("school", "brandColor", e.target.value)}
                className="absolute h-0 w-0 opacity-0"
              />
              <div
                className="h-full w-full rounded-lg"
                style={{ backgroundColor: formData.school.brandColor }}
              />
            </label>
            <input
              type="text"
              value={formData.school.brandColor}
              onChange={(e) => handleChange("school", "brandColor", e.target.value)}
              className="focus:ring-accent flex-1 rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm outline-none focus:border-transparent focus:ring-2"
              placeholder="#DA3743"
              pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This color will be used throughout your portal interface
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-3">
            <Select value={countryCode} onValueChange={handleCountryCodeChange}>
              <SelectTrigger className="h-12 w-32">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              className="focus:ring-accent w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="8012345678"
              value={phoneNumberValue}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
              {errors.phone}
            </p>
          )}
        </div>

        <FormField
          label="Address"
          required
          error={errors.address}
          value={formData.school.address}
          onChange={(e) => handleChange("school", "address", e.target.value)}
          maxLength={200}
          placeholder="Enter your school's address"
        />
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2 md:grid-cols-2 md:gap-4">
        <Button onClick={onCancel} variant="outline" className="px-4 py-3">
          Back
        </Button>
        <Button type="submit" className="px-4 py-3">
          Next
        </Button>
      </div>
    </form>
  )

  function handleChange(section: keyof FormData, field: string, value: string | File) {
    updateFormData(section, field, value)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    updateFormData("school", "logo", file)
    updateFormData("school", "logoPreview", previewUrl)

    try {
      const uploadedUrl = await getPhotoUrl(file)
      updateFormData("school", "logoUrl", uploadedUrl)
      updateFormData("school", "logoPreview", uploadedUrl)
    } catch (error) {
      console.error("Failed to upload school logo:", error)
    }
  }

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
    updateFormData("school", "phone", `${countryCode}${digitsOnly}`)
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }))
    }
  }

  function handleCountryCodeChange(value: string) {
    setCountryCode(value)
    const digitsOnly = phoneNumberValue.replace(/\D/g, "").slice(0, 10)
    updateFormData("school", "phone", `${value}${digitsOnly}`)
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = schoolSchema.safeParse(formData.school)

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
}
