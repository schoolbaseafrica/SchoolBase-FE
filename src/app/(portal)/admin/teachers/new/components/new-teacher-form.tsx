"use client"

import {
  NewPersonFormBuilder,
  NewPersonFormConfig,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { CreateTeacherData } from "@/lib/teachers"
import { useRouter } from "next/navigation"
import { useCreateTeacher } from "../../_hooks/use-teachers"

const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

export const teacherFormConfig: NewPersonFormConfig = {
  fields: [
    {
      name: "title",
      label: "Select Title",
      type: "select",
      required: true,
      options: [
        { value: "Mr", label: "Mr." },
        { value: "Miss", label: "Miss" },
        { value: "Mrs", label: "Mrs." },
        { value: "Dr", label: "Dr." },
        { value: "Prof", label: "Prof." },
      ],
    },
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name",
      required: true,
    },
    {
      name: "middleName",
      label: "Middle Name",
      type: "text",
      placeholder: "Enter middle name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "employmentId",
      label: "Employment ID",
      type: "text",
      placeholder: "EMP-YYYY-XXX",
      required: true,
      // add regex checker
      pattern: "EMP-\\d{4}-\\d{3}",
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      required: true,
      minAge: 18,
    },
    {
      name: "generatedPassword",
      label: "Password", // Changed label
      type: "password-generate", // Allow editing
      placeholder: "Enter or generate password",
      required: true,
      generateButton: {
        text: "Generate",
        onGenerate: generatePassword,
      },
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "+234 810 942 3124 or 0903456789",
      required: true,
    },
    {
      name: "homeAddress",
      label: "Home Address",
      type: "text",
      placeholder: "Enter home address",
      required: true,
    },
    // {
    //   name: "photo",
    //   label: "Upload Photo (150x150)",
    //   type: "file",
    //   accept: "image/*",
    //   buttonText: "Select file",
    // },
  ],
  submitText: "Save",
  cancelText: "Cancel",
}

export default function NewTeacherForm() {
  const router = useRouter()
  const createNewTeacher = useCreateTeacher().mutateAsync

  return (
    <NewPersonFormBuilder
      key={"new-teacher"}
      config={teacherFormConfig}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  )

  async function handleCancel() {
    router.push("/admin/teachers")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    // Capitalize gender: backend expects "Male", "Female", "Other"
    const genderValue = formData.gender as string
    const capitalizedGender =
      genderValue.charAt(0).toUpperCase() + genderValue.slice(1).toLowerCase()

    // Helper to convert empty strings to undefined for optional fields
    const optionalString = (value: unknown): string | undefined => {
      const str = value as string
      return str && str.trim() ? str.trim() : undefined
    }

    // Helper to format Nigerian phone numbers to international format
    // Converts formats like: "09034567890", "08034567890", "+234 903 456 7890" to "+234 903 456 7890"
    // Nigerian numbers: 11 digits with leading 0, or 10 digits without (standard is 11 digits)
    const formatPhoneNumber = (phone: string): string => {
      const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "").trim()

      // If it already starts with +234 and is properly formatted, return as is
      if (cleaned.startsWith("+234")) {
        const digits = cleaned.substring(4)
        // If it has exactly 10 digits after +234, format it properly
        if (digits.length === 10) {
          return `+234 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
        }
        // If already formatted with spaces, return as is
        if (phone.includes(" ")) {
          return phone
        }
        // If it's already +234 followed by 10 digits, format it
        if (/^\+234\d{10}$/.test(cleaned)) {
          const digits = cleaned.substring(4)
          return `+234 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
        }
      }

      // If it starts with 234 (without +), add the +
      if (cleaned.startsWith("234") && cleaned.length === 13) {
        const digits = cleaned.substring(3)
        return `+234 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
      }

      // If it starts with 0 (local format with leading 0), replace with +234
      // Nigerian numbers should be 11 digits: 0 + 10 digits, but handle 10-digit cases too
      if (cleaned.startsWith("0")) {
        const digits = cleaned.substring(1) // Remove leading 0
        // After removing 0, should have 10 digits for a valid number
        if (digits.length === 10) {
          return `+234 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
        }
      }

      // If it's 10 digits and doesn't start with 0 (local format without leading 0), add +234
      // This is the standard format: 10 digits represent the number after removing the leading 0
      if (/^\d{10}$/.test(cleaned) && !cleaned.startsWith("0")) {
        return `+234 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
      }

      // If it's 11 digits total, assume first digit is 0 (local format)
      if (/^\d{11}$/.test(cleaned)) {
        const digits = cleaned.substring(1) // Remove first digit (assumed to be 0)
        return `+234 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
      }

      // Return as-is if we can't recognize the format (let backend validation handle it)
      return phone
    }

    const newTeacher: CreateTeacherData = {
      title: formData.title as string,
      first_name: formData.firstName as string,
      last_name: formData.lastName as string,
      middle_name: optionalString(formData.middleName),
      email: formData.email as string,
      employment_id: optionalString(formData.employmentId),
      phone: formatPhoneNumber(formData.phoneNumber as string),
      date_of_birth: formData.dateOfBirth as string,
      gender: capitalizedGender,
      home_address: optionalString(formData.homeAddress),
      password: optionalString(formData.generatedPassword),
    }

    try {
      // Log payload so we can inspect what is sent to the backend
      console.log("Creating teacher — payload:", newTeacher)
      console.log(
        "Creating teacher — payload (JSON):",
        JSON.stringify(newTeacher, null, 2)
      )
      const createdTeacher = await createNewTeacher(newTeacher)
      console.log("Teacher creation response:", createdTeacher)
      // Small delay to ensure store update completes before redirect
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push("/admin/teachers")
    } catch (err) {
      // Surface error details in the console for debugging
      console.error("Failed to create teacher:", err)
      // Log the full error object for better debugging
      if (err instanceof Error) {
        console.error("Error message:", err.message)
      }
      // Log Axios error response if available
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown; status?: number } }
        console.error("Backend error response:", axiosErr.response?.data)
        console.error("Backend error status:", axiosErr.response?.status)
      }
      throw err
    }
  }
}
