// FILE: src/app/(portal)/teacher/attendance/mark/[classId]/page.tsx

"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { useGetClassStudents } from "@/app/(portal)/admin/class-management/_hooks/use-classes"
import { toast } from "sonner"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: students, isLoading } = useGetClassStudents(classId)

  const toggleAttendance = (studentId: string, studentName: string) => {
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

    setIsSubmitting(true)
    try {
      // TODO: Implement API call to submit attendance
      // const response = await AttendanceAPI.markDailyAttendance({
      //   class_id: classId,
      //   date: new Date().toISOString().split("T")[0],
      //   attendance_records: Array.from(attendance.values()),
      // })

      toast.success("Attendance marked successfully")
      router.push("/teacher/attendance")
    } catch (error) {
      toast.error("Failed to mark attendance")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
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
                            onCheckedChange={() =>
                              toggleAttendance(student.student_id, student.name)
                            }
                          />
                          <span className="text-sm">Present</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={isAbsent}
                            onCheckedChange={() =>
                              toggleAttendance(student.student_id, student.name)
                            }
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
              disabled={isSubmitting || attendance.size === 0}
            >
              {isSubmitting ? (
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
