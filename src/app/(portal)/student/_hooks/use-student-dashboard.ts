"use client"

import { useQuery } from "@tanstack/react-query"
import { StudentAPI } from "@/lib/api/student"
import { useStudentAuth } from "@/hooks/use-auth-user"
import { apiFetch } from "@/lib/api/client"

interface MonthlyAttendanceResponse {
  message: string
  month: string
  year: number
  student_id: string
  total_days_in_month: number
  days_present: number
  days_absent: number
  days_late: number
  days_excused: number
  days_half_day: number
}

export function useStudentDashboard() {
  const { studentId } = useStudentAuth()

  // Fetch dashboard data
  const dashboardQuery = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      console.log("[useStudentDashboard] Fetching dashboard data")
      const response = await StudentAPI.getDashboard()
      console.log("[useStudentDashboard] Dashboard response:", response)
      console.log("[useStudentDashboard] Dashboard data:", response.data)
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch attendance data for current month
  const attendanceQuery = useQuery<{ data: MonthlyAttendanceResponse }, Error>({
    queryKey: ["student-attendance-monthly", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required")
      console.log("[useStudentDashboard] Fetching attendance for studentId:", studentId)
      const response = await apiFetch<{ data: MonthlyAttendanceResponse }>(
        `/attendance/daily/student/${studentId}/monthly`,
        { method: "GET" },
        true
      )
      console.log("[useStudentDashboard] Attendance response:", response)
      return response
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })

  // Calculate attendance percentage
  const attendancePercent = attendanceQuery.data?.data
    ? attendanceQuery.data.data.total_days_in_month > 0
      ? Math.round(
          (attendanceQuery.data.data.days_present /
            attendanceQuery.data.data.total_days_in_month) *
            100
        )
      : 0
    : undefined

  return {
    ...dashboardQuery,
    attendancePercent,
    attendanceData: attendanceQuery.data?.data,
    isAttendanceLoading: attendanceQuery.isLoading,
    attendanceError: attendanceQuery.error,
  }
}
