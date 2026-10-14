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
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

const generatePassword = () => {
  return generateSecurePassword(12)
}

// Base form config without class field (used by both new and edit forms)
export const baseStudentFormConfig: NewPersonFormConfig = {
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
      required: false,
    },
    {
      name: "password",
      label: "Password",
      type: "password-generate",
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
  ],
  submitText: "Save",
  cancelText: "Cancel",
}

export default function NewStudentForm() {
  const router = useRouter()
  const [createdCredentials, setCreatedCredentials] = useState<{
    registrationNumber: string
    password: string
  } | null>(null)
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
  const studentFormConfig: NewPersonFormConfig = useMemo(
    () => ({
      ...baseStudentFormConfig,
      fields: [
        ...baseStudentFormConfig.fields,
        {
          name: "class_id",
          label: "Class (Optional)",
          type: "select",
          required: false,
          placeholder: "Select a class",
          options: [{ value: "__none__", label: "None (Unassigned)" }, ...classOptions],
        },
      ],
    }),
    [classOptions]
  )

  async function handleCancel() {
    router.push("/admin/students")
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    const newStudent: CreateStudentData = {
      first_name: formData.first_name as string,
      last_name: formData.last_name as string,
      middle_name: formData.middle_name as string,
      registration_number: formData.registration_number as string | undefined,
      email: (formData.email as string)?.trim() || undefined,
      password: formData.password as string,
      gender: formData.gender as string,
      date_of_birth: formData.date_of_birth as string,
      phone: formData.phone as string,
      home_address: formData.home_address as string,
      is_active: true,
      class_id:
        formData.class_id && (formData.class_id as string) !== "__none__"
          ? (formData.class_id as string)
          : undefined,
    }

    try {
      const created = await createNewStudent(newStudent)
      if (newStudent.email) {
        router.push("/admin/students")
      } else {
        setCreatedCredentials({
          registrationNumber: created.registration_number || "",
          password: newStudent.password,
        })
      }
    } catch (err) {
      throw err
    }
  }

  if (createdCredentials) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Student account created</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Give these credentials to the student securely. They can sign in with the
          registration number because no email was provided. The password is shown only
          now.
        </p>
        <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Registration number</dt>
            <dd className="font-semibold break-all">
              {createdCredentials.registrationNumber}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Password</dt>
            <dd className="font-semibold break-all">{createdCredentials.password}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() =>
              void navigator.clipboard.writeText(
                `Registration number: ${createdCredentials.registrationNumber}\nPassword: ${createdCredentials.password}`
              )
            }
          >
            Copy credentials
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/students")}
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <NewPersonFormBuilder
      key={"new-student"}
      config={studentFormConfig}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  )
}
