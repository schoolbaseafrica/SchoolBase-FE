"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Save, Users, UserMinus, X } from "lucide-react"
import { useGetClassStudents } from "@/app/(portal)/admin/class-management/_hooks/use-classes"
import { toast } from "sonner"
import { ItemLoader } from "@/app/(portal)/admin/_components/sub-loader"
import { useSubmitAttendance } from "../../_hooks/use-attendance"
import { format } from "date-fns"

interface StudentAttendance {
  student_id: string
  status: "PRESENT" | "ABSENT"
  notes?: string
}

const MarkAttendancePage = () => {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [attendance, setAttendance] = useState<Map<string, StudentAttendance>>(new Map())

  const { data: students, isLoading } = useGetClassStudents(classId)
  const submitAttendanceMutation = useSubmitAttendance(classId)

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(studentId)

      if (current) {
        if (current.status === "PRESENT") {
          newMap.set(studentId, { student_id: studentId, status: "ABSENT" })
        } else {
          newMap.delete(studentId)
        }
      } else {
        newMap.set(studentId, { student_id: studentId, status: "PRESENT" })
      }

      return newMap
    })
  }

  // Bulk marking functions
  const markAllPresent = () => {
    if (!students || students.length === 0) return

    const newMap = new Map<string, StudentAttendance>()
    students.forEach((student) => {
      newMap.set(student.student_id, {
        student_id: student.student_id,
        status: "PRESENT",
      })
    })
    setAttendance(newMap)
    toast.success("All students marked as present")
  }

  const markAllAbsent = () => {
    if (!students || students.length === 0) return

    const newMap = new Map<string, StudentAttendance>()
    students.forEach((student) => {
      newMap.set(student.student_id, {
        student_id: student.student_id,
        status: "ABSENT",
      })
    })
    setAttendance(newMap)
    toast.success("All students marked as absent")
  }

  const clearAll = () => {
    setAttendance(new Map())
    toast.success("All attendance marks cleared")
  }

  const updateNotes = (studentId: string, notes: string) => {
    setAttendance((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(studentId)
      if (current) {
        newMap.set(studentId, { ...current, notes })
      }
      return newMap
    })
  }

  const handleSubmit = async () => {
    if (attendance.size === 0) {
      toast.error("Please mark attendance for at least one student")
      return
    }

    try {
      const today = format(new Date(), "yyyy-MM-dd")
      await submitAttendanceMutation.mutateAsync({
        class_id: classId,
        date: today,
        attendance_records: Array.from(attendance.values()),
      })
      // Success toast is handled by the mutation
      router.push("/teacher/attendance")
    } catch (error) {
      console.error("Failed to mark attendance", error)
      // Error toast is handled by the mutation
    }
  }

  if (isLoading) {
    return <ItemLoader item="attendance" />
  }

  return (
    <div className="px-5 pt-10">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <DashboardTitle
        heading="Mark Attendance"
        description={`Mark attendance for students - ${new Date().toLocaleDateString()}`}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bulk Action Buttons */}
          {students && students.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 border-b pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllPresent}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAbsent}
                className="flex items-center gap-2"
              >
                <UserMinus className="h-4 w-4" />
                Mark All Absent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">
                  {attendance.size} of {students.length} marked
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {students && students.length > 0 ? (
              students.map((student) => {
                const attendanceRecord = attendance.get(student.student_id)
                const isPresent = attendanceRecord?.status === "PRESENT"
                const isAbsent = attendanceRecord?.status === "ABSENT"

                return (
                  <div
                    key={student.student_id}
                    className="flex flex-col gap-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.registration_number}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={() => toggleAttendance(student.student_id)}
                          />
                          <span className="text-sm">Present</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={isAbsent}
                            onCheckedChange={() => toggleAttendance(student.student_id)}
                          />
                          <span className="text-sm">Absent</span>
                        </label>
                      </div>
                    </div>

                    {isAbsent && (
                      <Input
                        placeholder="Add notes (optional)"
                        value={attendanceRecord?.notes || ""}
                        onChange={(e) => updateNotes(student.student_id, e.target.value)}
                      />
                    )}
                  </div>
                )
              })
            ) : (
              <p className="py-8 text-center text-gray-500">
                No students found in this class
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitAttendanceMutation.isPending || attendance.size === 0}
            >
              {submitAttendanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Attendance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MarkAttendancePage
