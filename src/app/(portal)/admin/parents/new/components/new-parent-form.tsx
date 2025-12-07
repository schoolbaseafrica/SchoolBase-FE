"use client"

import {
  NewPersonFormBuilder,
  NewPersonFormConfig,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { CreateParentData } from "@/lib/parents"
import { useRouter } from "next/navigation"
import { useCreateParent } from "../../_hooks/use-parents"

const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

export const parentFormConfig: NewPersonFormConfig = {
  fields: [
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name",
      required: true,
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name",
      required: true,
    },
    {
      name: "middle_name",
      label: "Middle Name",
      type: "text",
      placeholder: "Enter middle name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "password",
      label: "Password",
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
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      required: true,
      minAge: 18,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "home_address",
      label: "Home Address",
      type: "text",
      placeholder: "Enter home address",
      required: true,
    },
    // {
    //   name: "photo_url",
    //   label: "Upload Photo (150x150)",
    //   type: "file",
    //   accept: "image/*",
    //   buttonText: "Select file",
    //   required: false,
    // },
  ],
  submitText: "Save",
  cancelText: "Cancel",
}

export default function NewParentForm() {
  const router = useRouter()
  const createNewParent = useCreateParent().mutateAsync

  return (
    <NewPersonFormBuilder
      key={"new-parent"}
      config={parentFormConfig}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  )

  async function handleCancel() {
    router.push("/admin/parents")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    // const photoData = formData.photo as { file: File; previewUrl: string } | undefined

    const newParent: CreateParentData = {
      first_name: formData.first_name as string,
      last_name: formData.last_name as string,
      middle_name: formData.middle_name as string,
      email: formData.email as string,
      password: formData.password as string,
      gender: formData.gender as string,
      date_of_birth: formData.date_of_birth as string,
      phone: formData.phone as string,
      home_address: formData.home_address as string,
      // photo_url: photoData?.file,
      is_active: true,
    }

    try {
      console.log("Creating parent — payload:", newParent)
      await createNewParent(newParent)
      router.push("/admin/parents")
    } catch (err) {
      console.error("Failed to create parent:", err)
      throw err
    }
  }
}
