import React, { useState } from "react"
import { UploadIcon } from "lucide-react"
import { z } from "zod"
import { Errors, FormData } from "../_types/setup"
import ProgressIndicator from "./progress-indicator"
import { FormField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const schoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
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

  return (
    <form className="p-2 md:p-12" onSubmit={handleSubmit}>
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">
        School Information
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Add your school&apos;s branding and contact information
      </p>

      <ProgressIndicator key="progress" currentStep={2} />

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

        <FormField
          label="Phone Number"
          type="tel"
          required
          error={errors.phone}
          value={formData.school.phone}
          onChange={(e) => handleChange("school", "phone", e.target.value)}
          placeholder="+234 900 000 0000"
          inputMode="tel"
        />

        <FormField
          label="Address"
          required
          error={errors.address}
          value={formData.school.address}
          onChange={(e) => handleChange("school", "address", e.target.value)}
          placeholder="Enter your school's address"
        />
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

  function handleChange(section: keyof FormData, field: string, value: string | File) {
    updateFormData(section, field, value)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    updateFormData("school", "logo", file)
    updateFormData("school", "logoPreview", previewUrl)
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
