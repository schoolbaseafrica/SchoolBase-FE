import { FormField } from "@/components/ui/form-field"
import ProgressIndicator from "./progress-indicator"
import { Button } from "@/components/ui/button"
import { Errors, FormData } from "../_types/setup"
import { useState } from "react"
import { z } from "zod"
import { AlertCircleIcon, EyeClosedIcon, EyeIcon } from "lucide-react"

// Zod Schemas
const databaseSchema = z.object({
  name: z
    .string()
    .min(1, "Database name is required")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      "Database name can only contain letters, numbers, and underscores, and cannot start with a number"
    ),
  host: z.string().min(1, "Database host is required"),
  username: z.string().min(1, "Database username is required"),
  port: z.number().max(65535, "Port must be less than or equal to 65535"),
  type: z.enum(
    ["postgres", "mysql", "sqlite", "mssql", "mariadb"],
    "Must be one of postgres, mysql, sqlite, mssql, mariadb"
  ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
})

interface DatabaseConfigFormProps {
  formData: FormData
  updateFormData: (section: keyof FormData, field: string, value: string | number) => void
  onSubmit: () => void
  onCancel: () => void
}

export function DatabaseConfigForm({
  formData,
  updateFormData,
  onSubmit,
  onCancel,
}: DatabaseConfigFormProps) {
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="p-2 md:p-12" onSubmit={handleSubmit}>
      <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">
        Database Configuration
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Configure your database connection settings.
      </p>

      <ProgressIndicator currentStep={1} />

      <div className="animate-onrender mb-8 space-y-6">
        <FormField
          label="Database Name"
          required
          error={errors.name}
          value={formData.database.name}
          onChange={(e) => handleChange("database", "name", e.target.value)}
          placeholder="your database name"
        />

        <div className="relative">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[2fr_1fr] md:items-start">
            <FormField
              label="Database Username"
              required
              value={formData.database.username}
              onChange={(e) => handleChange("database", "username", e.target.value)}
              placeholder="your database user"
            />

            <FormField
              type="text"
              label="Type"
              required
              value={formData.database.type}
              onChange={(e) => handleChange("database", "type", e.target.value)}
              placeholder="postgres"
            />
          </div>

          {!!(errors.type || errors.username) && (
            <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
              <AlertCircleIcon /> {errors.username ? "Username: " + errors.username : ""}{" "}
              {errors.type ? "Type: " + errors.type : ""}{" "}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="grid grid-cols-[3fr_1fr] items-center gap-4">
            <FormField
              label="Database Host"
              required
              value={formData.database.host}
              onChange={(e) => handleChange("database", "host", e.target.value)}
              placeholder="localhost"
            />

            <FormField
              type="number"
              label="Port"
              required
              value={formData.database.port}
              onChange={(e) => handleChange("database", "port", Number(e.target.value))}
              placeholder="8000"
              pattern="\d*"
            />
          </div>

          {!!(errors.host || errors.port) && (
            <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
              {" "}
              <AlertCircleIcon /> {errors.host ? "Host: " + errors.host : ""}{" "}
              {errors.port ? "Port: " + errors.port : ""}{" "}
            </p>
          )}
        </div>

        <FormField
          label="Database Password"
          required
          type={showPassword ? "text" : "password"}
          error={errors.password}
          value={formData.database.password}
          onChange={(e) => handleChange("database", "password", e.target.value)}
          placeholder="************"
        >
          <div
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer md:right-4"
            role="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => {
              setShowPassword((a) => !a)
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                setShowPassword((a) => !a)
              }
            }}
          >
            {showPassword ? (
              <EyeClosedIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2 md:grid-cols-2 md:gap-4">
        <Button type="button" onClick={onCancel} variant="outline" className="px-4 py-3">
          Back
        </Button>
        <Button type="submit" className="px-4 py-3">
          Submit & Continue
        </Button>
      </div>
    </form>
  )

  function handleChange(section: keyof FormData, field: string, value: string | number) {
    updateFormData(section, field, value)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = databaseSchema.safeParse(formData.database)

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
