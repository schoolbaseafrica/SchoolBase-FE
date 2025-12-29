"use client"

import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { sendContactMessage } from "@/services/contact-api"

const contactSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  school_name: z.string().min(1, "School name is required"),
  message: z.string().min(1, "Message cannot be empty"),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    full_name: "",
    email: "",
    school_name: "",
    message: "",
  })

  const [errors, setErrors] = useState<Partial<ContactFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = contactSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<ContactFormData> = {}

      // Use result.error.issues instead of result.error.errors
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof ContactFormData
        fieldErrors[fieldName] = err.message
      })

      setErrors(fieldErrors)
      return
    }

    // No errors
    setErrors({})
    setIsLoading(true)

    try {
      await sendContactMessage(formData)
      toast.success(`Thank you, ${formData.full_name}! Your message has been sent.`)

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        school_name: "",
        message: "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="mb-1 block font-medium">
          Full Name
        </label>
        <Input
          id="full_name"
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full"
          disabled={isLoading}
        />
        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full"
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="school_name" className="mb-1 block font-medium">
          School Name
        </label>
        <Input
          id="school_name"
          type="text"
          name="school_name"
          value={formData.school_name}
          onChange={handleChange}
          className="w-full"
          disabled={isLoading}
        />
        {errors.school_name && (
          <p className="text-sm text-red-500">{errors.school_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-xl border px-3 py-2"
          rows={4}
          disabled={isLoading}
        />
        {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
