"use client"

import {
  NewPersonFormBuilder,
  NewPersonFormConfig,
} from "@/app/(portal)/admin/_components/add-new-person-form-template"
import { CreateStudentData } from "@/lib/students"
import { useRouter } from "next/navigation"
import { useCreateStudent } from "../../_hooks/use-students"
import { generateSecurePassword } from "@/lib/utils/password-generator"
import { useGetClassesInfo } from "@/app/(portal)/admin/class-management/_hooks/use-classes"
import { useMemo } from "react"

const generatePassword = () => {
  return generateSecurePassword(12)
}
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
      name: "registration_number",
      label: "Registration Number (Optional)",
      type: "text",
      placeholder: "Enter custom ID or leave empty for auto-generation",
      required: false,
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
      type: "password-generate", // Changed to allow editing
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
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
    },
    {
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      required: true,
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
    {
      name: "class_id",
      label: "Class (Optional)",
      type: "select",
      required: false,
      placeholder: "Select a class",
      options: [
        { value: "", label: "None (Unassigned)" },
        ...classOptions,
      ],
    },
  ],
  submitText: "Save",
  cancelText: "Cancel",
}), [classOptions])

  return (
    <NewPersonFormBuilder
      key={"new-student"}
      config={studentFormConfig}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  )

export default function NewStudentForm() {
  const router = useRouter()
  const createNewStudent = useCreateStudent().mutateAsync
  
  // Fetch classes for class selection
  const { data: classesInfo } = useGetClassesInfo({ includeArchived: false })
  
  // Flatten classes structure for select options
  const classOptions = useMemo(() => {
    if (!classesInfo?.items) return []
    return classesInfo.items.flatMap((group) =>
      group.classes.map((cls) => ({
        value: cls.id,
        label: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
      }))
    )
  }, [classesInfo])

  // Create dynamic form config with class field
  const studentFormConfig: NewPersonFormConfig = useMemo(() => ({

  async function handleCancel() {
    router.push("/admin/students")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    const newStudent: CreateStudentData = {
      first_name: formData.first_name as string,
      last_name: formData.last_name as string,
      middle_name: formData.middle_name as string,
      registration_number: formData.registration_number as string | undefined,
      email: formData.email as string,
      password: formData.password as string,
      gender: formData.gender as string,
      date_of_birth: formData.date_of_birth as string,
      phone: formData.phone as string,
      home_address: formData.home_address as string,
      is_active: true,
      class_id: formData.class_id && (formData.class_id as string).trim() !== "" 
        ? (formData.class_id as string) 
        : undefined,
    }

    try {
      await createNewStudent(newStudent)
      router.push("/admin/students")
    } catch (err) {
      throw err
    }
  }
}
