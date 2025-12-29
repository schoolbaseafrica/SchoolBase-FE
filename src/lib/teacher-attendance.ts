// FILE: src/lib/teacher-attendance.ts (with debugging)

import { apiFetch } from "./api/client"

export interface TeacherAssignedClass {
  id: string
  name: string
  arm?: string
  academicSession?: {
    id: string
    name: string
  }
  teacherIds?: string[]
}

export interface ManualCheckInPayload {
  date: string // ISO date format (YYYY-MM-DD)
  check_in_time: string // Time in HH:MM:SS format
  reason: string
}

export interface ManualCheckInResponse {
  message: string
  status_code: number
  data: {
    id: string
    teacher_id: string
    check_in_time: string
    reason: string
    created_at: string
  }
}

type ResponsePack<T> = {
  message: string
  status_code: number
  data: T
}

export const TeacherAttendanceAPI = {
  // Get classes assigned to teacher
  getAssignedClasses: async (sessionId?: string) => {
    const response = await apiFetch<
      TeacherAssignedClass[] | { message: string; data: TeacherAssignedClass[] }
    >(
      "/classes/teacher/assigned",
      {
        method: "GET",
        params: sessionId ? { session_id: sessionId } : undefined,
      },
      true
    )

    // Handle both wrapped and unwrapped responses
    if (Array.isArray(response)) {
      return response
    }
    // If wrapped, extract the data array
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: TeacherAssignedClass[] }).data
    }
    return response as TeacherAssignedClass[]
  },

  // Manual check-in for teacher
  manualCheckIn: async (payload: ManualCheckInPayload) => {
    // console.log("🔍 [DEBUG] Manual check-in payload:", payload)
    // console.log("📅 Date format:", payload.date)
    // console.log("⏰ Time format:", payload.time)
    // console.log("📝 Reason length:", payload.reason.length)

    // try {
    const response = await apiFetch<ManualCheckInResponse>(
      "/attendance/teacher/manual-checkin",
      {
        method: "POST",
        data: payload,
      },
      true
    )

    // console.log("✅ [DEBUG] Check-in response:", response)
    return response
    // } catch (error: any) {
    //   console.error("❌ [DEBUG] Check-in error:", error)
    //   console.error("❌ [DEBUG] Error response:", error?.response?.data)
    //   console.error("❌ [DEBUG] Error status:", error?.response?.status)
    //   throw error
    // }
  },

  // Get teacher's check-in status for today
  getTodayCheckInStatus: async () => {
    const response = await apiFetch<
      ResponsePack<{
        date: string
        status: string | null
        check_in_time: string | null
        check_out_time: string | null
        total_hours: number | null
        source: string | null
        has_attendance: boolean
        is_checked_out: boolean
        has_pending_request: boolean
      }>
    >(
      "/attendance/teacher/today",
      {
        method: "GET",
      },
      true
    )

    return response
  },
}

// DEBUGGING UTILITIES
// export const debugPayload = {
// Test if date format is correct
// validateDate: (date: string) => {
//   const regex = /^\d{4}-\d{2}-\d{2}$/
//   console.log(`Date "${date}" matches YYYY-MM-DD:`, regex.test(date))
//   return regex.test(date)
// },

// Test if time format is correct
// validateTime: (time: string) => {
//   const regex = /^\d{2}:\d{2}:\d{2}$/
//   console.log(`Time "${time}" matches HH:MM:SS:`, regex.test(time))
//   return regex.test(time)
// },

// Create a properly formatted payload
//   createTestPayload: (): ManualCheckInPayload => {
//     const now = new Date()
//     const payload = {
//       date: now.toISOString().split("T")[0], // YYYY-MM-DD
//       time: now.toTimeString().split(" ")[0], // HH:MM:SS
//       reason: "Test check-in",
//     }
//     console.log("🧪 Test payload created:", payload)
//     return payload
//   },
// }

// ALTERNATIVE DATE/TIME FORMATS (if backend expects different format)
export const alternativeFormats = {
  // ISO 8601 full datetime
  getISODateTime: () => {
    const now = new Date()
    return {
      dateTime: now.toISOString(), // "2025-12-05T14:30:00.000Z"
      date: now.toISOString().split("T")[0], // "2025-12-05"
      time: now.toISOString().split("T")[1].split(".")[0], // "14:30:00"
    }
  },

  // Local date/time
  getLocalDateTime: () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    return {
      date: `${year}-${month}-${day}`, // "2025-12-05"
      time: `${hours}:${minutes}:${seconds}`, // "14:30:00"
    }
  },
}
