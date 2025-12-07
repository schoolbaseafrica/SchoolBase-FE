"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface ClassroomFormData {
  name: string
  capacity: string
  type: string
  location: string
}

interface ClassroomFormProps {
  initialData?: ClassroomFormData
  onSubmit: (data: ClassroomFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitText?: string
}

export function ClassroomForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Save",
}: ClassroomFormProps) {
  const [formData, setFormData] = useState<ClassroomFormData>(
    initialData || {
      name: "",
      capacity: "",
      type: "",
      location: "",
    }
  )
  const [errors, setErrors] = useState<Partial<ClassroomFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ClassroomFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Classroom name is required"
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = "Capacity is required"
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be a positive number"
    } else if (!/^\d+$/.test(formData.capacity)) {
      newErrors.capacity = "Capacity must contain only numbers"
    }

    if (!formData.type.trim()) {
      newErrors.type = "Room type is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Failed to create classroom:", error)
      throw error
    }
  }

  const handleChange = (field: keyof ClassroomFormData, value: string) => {
    // For capacity field, only allow numbers
    if (field === "capacity" && value !== "" && !/^\d*$/.test(value)) {
      return
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name Field - Full Width */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Classroom Name <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter classroom name"
            className="w-full"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Capacity Field */}
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              Capacity <span className="text-red-600">*</span>
            </label>
            <Input
              id="capacity"
              type="text"
              inputMode="numeric"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              placeholder="Enter capacity"
              pattern="[0-9]*"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
          </div>

          {/* Type Field - Changed from Select to Input */}
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              Room Type <span className="text-red-600">*</span>
            </label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              placeholder="Enter room type (e.g., PHYSICAL, VIRTUAL, LAB)"
            />
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Location <span className="text-red-600">*</span>
          </label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Enter location (e.g., Floor 2, Building A)"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-8"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-8">
          {isSubmitting ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  )
}
