import { apiFetch } from "@/lib/api/client"

export interface AttendanceRecord {
  student_id: string
  status: "PRESENT" | "ABSENT"
  notes?: string
}

export interface SubmitAttendancePayload {
  class_id: string
  date: string
  attendance_records: AttendanceRecord[]
}

export interface SubmitAttendanceResponse {
  message: string
  status_code: number
  data: {
    marked: number
    updated: number
    total: number
  }
}

export interface AttendanceStudent {
  student_id: string
  first_name: string
  middle_name?: string
  last_name: string
  attendance_id: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HALF_DAY" | "NOT_MARKED"
  check_in_time?: string
  check_out_time?: string
  notes?: string
}

export interface AttendanceSummary {
  total_students: number
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
  half_day_count: number
  not_marked_count: number
}

export interface AttendanceResponse {
  class_id: string
  date: string
  students: AttendanceStudent[]
  summary: AttendanceSummary
}

export const AttendanceAPI = {
  markDailyAttendance: (payload: SubmitAttendancePayload) =>
    apiFetch<SubmitAttendanceResponse>(
      "/attendance/daily/student",
      {
        method: "POST",
        data: payload,
      },
      true
    ),

  // get daily attendance for admin
  getDailyAttendanceByClass: (classId: string, date: string) =>
    apiFetch<AttendanceResponse>(`/attendance/daily/student/class/${classId}`, {
      method: "GET",
      params: { date },
    }),
}
