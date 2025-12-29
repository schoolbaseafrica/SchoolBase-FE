"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleAlert } from "lucide-react"
import type { UseFormRegister, FieldError, Path } from "react-hook-form"
import type { SessionFormData } from "../_schemas/session-form-schema"

interface Props {
  name: Path<SessionFormData> // <-- allows "terms.first_term.startDate"
  label: string
  register: UseFormRegister<SessionFormData>
  error?: FieldError
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const DateField = ({ name, label, register, error, onChange }: Props) => {
  return (
    <div className="space-y-1">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>

      <Input
        type="date"
        {...register(name, { onChange })}
        className={error ? "border-red-500" : ""}
      />

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <CircleAlert className="h-4 w-4" />
          {error.message}
        </p>
      )}
    </div>
  )
}

export default DateField
