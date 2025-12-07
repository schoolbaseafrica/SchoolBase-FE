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
      placeholder: "Enter phone number",
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
    // const subjects = [
    //   "Mathematics",
    //   "English",
    //   "Science",
    //   "History",
    //   "Geography",
    //   "Art",
    //   "Physical Education",
    //   "Music",
    //   "Computer Science",
    //   "Biology",
    // ]
    // const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]

    const newTeacher: CreateTeacherData = {
      title: formData.title as string,
      first_name: formData.firstName as string,
      last_name: formData.lastName as string,
      middle_name: formData.middleName as string,
      email: formData.email as string,
      employment_id: formData.employmentId as string,
      phone: formData.phoneNumber as string,
      date_of_birth: formData.dateOfBirth as string,
      gender: formData.gender as string,
      home_address: formData.homeAddress as string,
    }

    try {
      // Log payload so we can inspect what is sent to the backend
      console.log("Creating teacher — payload:", newTeacher)
      await createNewTeacher(newTeacher)
      router.push("/admin/teachers")
    } catch (err) {
      // Surface error details in the console for debugging
      console.error("Failed to create teacher:", err)
      throw err
    }
  }
}
