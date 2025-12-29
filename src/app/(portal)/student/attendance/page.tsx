"use client"

import { useStudentAuth } from "@/hooks/use-auth-user"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"

interface MonthlyAttendanceResponse {
  message: string
  month: string
  year: number
  registration_number?: string // Optional, not returned by student endpoint
  student_id: string
  total_days_in_month: number
  days_present: number
  days_absent: number
  days_late: number
  days_excused: number
  days_half_day: number
  attendance_details?: Array<{
    date: string
    status: string
    check_in_time?: string
    check_out_time?: string
    notes?: string
  }>
}

export default function StudentAttendancePage() {
  const { studentId } = useStudentAuth()

  // Get monthly attendance using student-specific endpoint
  const {
    data: attendance,
    isLoading,
    error: attendanceError,
  } = useQuery<MonthlyAttendanceResponse>({
    queryKey: ["student-attendance", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required")
      console.log("[StudentAttendancePage] Fetching attendance for studentId:", studentId)
      const response = await apiFetch<{ data: MonthlyAttendanceResponse }>(
        `/attendance/daily/student/${studentId}/monthly`,
        { method: "GET" },
        true
      )
      console.log("[StudentAttendancePage] Attendance response:", response)
      console.log("[StudentAttendancePage] Unwrapped data:", response.data)
      return response.data
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  // Debug logging
  console.log("[StudentAttendancePage] State:", {
    studentId,
    isLoading,
    attendanceError,
    attendance: attendance
      ? {
          total_days_in_month: attendance.total_days_in_month,
          days_present: attendance.days_present,
          days_absent: attendance.days_absent,
          days_late: attendance.days_late,
          attendance_details_count: attendance.attendance_details?.length || 0,
        }
      : null,
  })

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-gray-600">View your attendance records</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Student information not available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-gray-600">View your attendance records</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : attendance ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Present Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {attendance.days_present}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Absent Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {attendance.days_absent}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Late Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {attendance.days_late}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {attendance.total_days_in_month > 0
                    ? `${Math.round((attendance.days_present / attendance.total_days_in_month) * 100)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500">
                  for {attendance.month} {attendance.year}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Attendance Details - {attendance.month} {attendance.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.attendance_details &&
              attendance.attendance_details.length > 0 ? (
                <div className="space-y-2">
                  {attendance.attendance_details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            detail.status === "PRESENT"
                              ? "bg-green-500"
                              : detail.status === "ABSENT"
                                ? "bg-red-500"
                                : detail.status === "LATE"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium">
                            {format(new Date(detail.date), "EEEE, MMMM d, yyyy")}
                          </p>
                          {detail.check_in_time && (
                            <p className="text-sm text-gray-500">
                              Check-in:{" "}
                              {format(new Date(detail.check_in_time), "hh:mm a")}
                            </p>
                          )}
                          {detail.notes && (
                            <p className="text-sm text-gray-500">{detail.notes}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          detail.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : detail.status === "ABSENT"
                              ? "bg-red-100 text-red-700"
                              : detail.status === "LATE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {detail.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-gray-500">
                  No attendance records available for this month
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : attendanceError ? (
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-red-600">Error loading attendance data</p>
              <p className="mt-2 text-sm text-gray-500">
                {attendanceError instanceof Error
                  ? attendanceError.message
                  : "An error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">No attendance data available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
