"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardCheck, Eye, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeacherAssignedClass } from "@/lib/teacher-attendance"

interface ClassTeacherViewProps {
  assignedClasses: TeacherAssignedClass[]
}

export default function ClassTeacherView({ assignedClasses }: ClassTeacherViewProps) {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState("")
  const effectiveClassId = assignedClasses.some((item) => item.id === selectedClassId)
    ? selectedClassId
    : (assignedClasses[0]?.id ?? "")
  const selectedClass = assignedClasses.find((item) => item.id === effectiveClassId)

  if (!selectedClass) return null

  const className = `${selectedClass.name}${selectedClass.arm ? ` ${selectedClass.arm}` : ""}`

  return (
    <div className="portal-reveal rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--portal-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <label
            htmlFor="attendance-class"
            className="text-foreground block text-base font-semibold"
          >
            Choose your class
          </label>
          <p className="text-muted-foreground mt-1 text-sm">
            {assignedClasses.length} assigned{" "}
            {assignedClasses.length === 1 ? "class" : "classes"} · Select the class whose
            attendance you want to manage.
          </p>
        </div>
        <Select value={effectiveClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger
            id="attendance-class"
            className="h-11 w-full lg:w-80"
            aria-label="Choose your class"
          >
            <SelectValue placeholder="Choose a class" />
          </SelectTrigger>
          <SelectContent>
            {assignedClasses.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
                {item.arm ? ` ${item.arm}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground mt-5 text-sm">
        Managing <span className="text-foreground font-semibold">{className}</span>
        {selectedClass.academicSession?.name
          ? ` · ${selectedClass.academicSession.name}`
          : ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          onClick={() => router.push(`/teacher/attendance/mark/${effectiveClassId}`)}
        >
          <ClipboardCheck className="mr-2 size-4" /> Mark attendance
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/attendance/face/${effectiveClassId}`)}
        >
          <Camera className="mr-2 size-4" /> Face check-in
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/teacher/attendance/view/${effectiveClassId}`)}
        >
          <Eye className="mr-2 size-4" /> View records
        </Button>
      </div>
    </div>
  )
}
