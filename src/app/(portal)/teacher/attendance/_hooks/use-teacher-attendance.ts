"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TeacherAttendanceAPI, ManualCheckInPayload } from "@/lib/teacher-attendance"
import { toast } from "sonner"
import { AxiosError } from "axios"

// QUERY KEYS
export const TEACHER_ATTENDANCE_KEYS = {
  assignedClasses: (sessionId?: string) =>
    sessionId ? ["teacher_assigned_classes", sessionId] : ["teacher_assigned_classes"],
  checkInStatus: ["teacher_checkin_status"],
}

/**
 * Hook to get classes assigned to the current teacher
 * @param sessionId - Optional academic session ID (defaults to active session on backend)
 */
export const useGetTeacherAssignedClasses = (sessionId?: string) => {
  return useQuery({
    queryKey: TEACHER_ATTENDANCE_KEYS.assignedClasses(sessionId),
    queryFn: () => TeacherAttendanceAPI.getAssignedClasses(sessionId),
    refetchOnWindowFocus: false,
    // retry: (failureCount) => {
    //   // Don't retry if it's a teacher profile not found error
    //   // if (error?.message?.includes("Teacher profile not found")) {
    //   //   return false
    //   // }
    //   // Retry other errors up to 2 times
    //   return failureCount < 2
    // },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get today's check-in status for the current teacher
 * Automatically refetches when window gains focus to ensure status is up-to-date
 */
export const useGetTodayCheckInStatus = () => {
  return useQuery({
    queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus,
    queryFn: () => TeacherAttendanceAPI.getTodayCheckInStatus(),
    select: (data) => data.data,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 0, // Always consider data stale to get fresh status
    retry: 1,
  })
}

/**
 * Hook to manually check in for the day
 * Automatically invalidates check-in status after successful submission
 */
export const useManualCheckIn = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: ManualCheckInPayload) => {
      // console.log("🔄 [HOOK] Calling manualCheckIn with:", payload)
      return TeacherAttendanceAPI.manualCheckIn(payload)
    },
    onSuccess: (response) => {
      // console.log("✅ [HOOK] Check-in successful:", response)
      toast.success(response.message || "Check-in successful! Have a great day.")
      // Invalidate check-in status to refetch and show updated state
      qc.invalidateQueries({ queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus })
    },
    onError: (err) => {
      console.error("❌ [HOOK] Check-in error:", err)

      if (err instanceof AxiosError) {
        console.error("❌ [HOOK] Axios error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data,
          },
        })

        const errorMessage = err?.response?.data?.message || err?.message
        toast.error(errorMessage || "Failed to check in. Please try again.")
      } else {
        console.error("❌ [HOOK] Non-Axios error:", err)
        toast.error("An unexpected error occurred. Please try again.")
      }
    },
  })
}

/**
 * Hook to mark student attendance for a class
 * Note: This uses the existing AttendanceAPI.markDailyAttendance
 * Make sure to import: import { AttendanceAPI } from "@/lib/attendance"
 * @param classId - The class ID to mark attendance for
 */
export const useMarkStudentAttendance = (classId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      date: string
      attendance_records: Array<{
        student_id: string
        status: "PRESENT" | "ABSENT"
        notes?: string
      }>
    }) => {
      // Import AttendanceAPI from @/lib/attendance and use:
      // return AttendanceAPI.markDailyAttendance({
      //   class_id: classId,
      //   date: payload.date,
      //   attendance_records: payload.attendance_records,
      // })

      // Temporary placeholder to avoid unused variable warning
      // console.log("Marking attendance:", payload)
      throw new Error(
        "AttendanceAPI.markDailyAttendance not yet connected. Please uncomment the code above and import AttendanceAPI."
      )
    },
    onSuccess: () => {
      toast.success("Attendance marked successfully")
      // Invalidate relevant queries to refetch updated data
      qc.invalidateQueries({ queryKey: ["dailyAttendance", classId] })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message ?? "Failed to mark attendance")
      } else {
        toast.error("Failed to mark attendance")
      }
    },
  })
}
// "use client"

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { TeacherAttendanceAPI, ManualCheckInPayload } from "@/lib/teacher-attendance"
// import { toast } from "sonner"
// import { AxiosError } from "axios"

// // QUERY KEYS
// export const TEACHER_ATTENDANCE_KEYS = {
//   assignedClasses: (sessionId?: string) =>
//     sessionId ? ["teacher_assigned_classes", sessionId] : ["teacher_assigned_classes"],
//   checkInStatus: ["teacher_checkin_status"],
// }

// /**
//  * Hook to get classes assigned to the current teacher
//  * @param sessionId - Optional academic session ID (defaults to active session on backend)
//  */
// export const useGetTeacherAssignedClasses = (sessionId?: string) => {
//   return useQuery({
//     queryKey: TEACHER_ATTENDANCE_KEYS.assignedClasses(sessionId),
//     queryFn: () => TeacherAttendanceAPI.getAssignedClasses(sessionId),
//     refetchOnWindowFocus: false,
//     retry: 2,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   })
// }

// /**
//  * Hook to get today's check-in status for the current teacher
//  * Automatically refetches when window gains focus to ensure status is up-to-date
//  */
// export const useGetTodayCheckInStatus = () => {
//   return useQuery({
//     queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus,
//     queryFn: () => TeacherAttendanceAPI.getTodayCheckInStatus(),
//     select: (data) => data.data,
//     refetchOnWindowFocus: true, // Refetch when user returns to tab
//     staleTime: 0, // Always consider data stale to get fresh status
//     retry: 1,
//   })
// }

// /**
//  * Hook to manually check in for the day
//  * Automatically invalidates check-in status after successful submission
//  */
// export const useManualCheckIn = () => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: (payload: ManualCheckInPayload) =>
//       TeacherAttendanceAPI.manualCheckIn(payload),
//     onSuccess: (response) => {
//       toast.success(response.message || "Check-in successful! Have a great day.")
//       // Invalidate check-in status to refetch and show updated state
//       qc.invalidateQueries({ queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus })
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         const errorMessage = err?.response?.data?.message || err?.message
//         toast.error(errorMessage || "Failed to check in. Please try again.")
//       } else {
//         toast.error("An unexpected error occurred. Please try again.")
//       }
//     },
//   })
// }

// /**
//  * Hook to mark student attendance for a class
//  * Note: This uses the existing AttendanceAPI.markDailyAttendance
//  * Make sure to import: import { AttendanceAPI } from "@/lib/attendance"
//  * @param classId - The class ID to mark attendance for
//  */
// export const useMarkStudentAttendance = (classId: string) => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: async (payload: {
//       date: string
//       attendance_records: Array<{
//         student_id: string
//         status: "PRESENT" | "ABSENT"
//         notes?: string
//       }>
//     }) => {
//       // Import AttendanceAPI from @/lib/attendance and use:
//       // return AttendanceAPI.markDailyAttendance({
//       //   class_id: classId,
//       //   date: payload.date,
//       //   attendance_records: payload.attendance_records,
//       // })

//       // Temporary placeholder to avoid unused variable warning
//       console.log("Marking attendance:", payload)
//       throw new Error(
//         "AttendanceAPI.markDailyAttendance not yet connected. Please uncomment the code above and import AttendanceAPI."
//       )
//     },
//     onSuccess: () => {
//       toast.success("Attendance marked successfully")
//       // Invalidate relevant queries to refetch updated data
//       qc.invalidateQueries({ queryKey: ["dailyAttendance", classId] })
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         toast.error(err?.response?.data?.message ?? "Failed to mark attendance")
//       } else {
//         toast.error("Failed to mark attendance")
//       }
//     },
//   })
// }
// // "use client"

// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// // import { TeacherAttendanceAPI, ManualCheckInPayload } from "@/lib/teacher-attendance"
// // import { toast } from "sonner"
// // import { AxiosError } from "axios"
// // import attendan
// // // QUERY KEYS
// // export const TEACHER_ATTENDANCE_KEYS = {
// //   assignedClasses: (sessionId?: string) =>
// //     sessionId ? ["teacher_assigned_classes", sessionId] : ["teacher_assigned_classes"],
// //   checkInStatus: ["teacher_checkin_status"],
// // }

// // /**
// //  * Hook to get classes assigned to the current teacher
// //  * @param sessionId - Optional academic session ID (defaults to active session on backend)
// //  */
// // export const useGetTeacherAssignedClasses = (sessionId?: string) => {
// //   return useQuery({
// //     queryKey: TEACHER_ATTENDANCE_KEYS.assignedClasses(sessionId),
// //     queryFn: () => TeacherAttendanceAPI.getAssignedClasses(sessionId),
// //     refetchOnWindowFocus: false,
// //     // retry: (failureCount) => {
// //     // Don't retry if it's a teacher profile not found error
// //     // if (error?.message?.includes("Teacher profile not found")) {
// //     //   return false
// //     // }
// //     // Retry other errors up to 2 times
// //     // return failureCount < 2
// //     // },
// //     staleTime: 5 * 60 * 1000, // 5 minutes
// //   })
// // }

// // /**
// //  * Hook to get today's check-in status for the current teacher
// //  * Automatically refetches when window gains focus to ensure status is up-to-date
// //  */
// // export const useGetTodayCheckInStatus = () => {
// //   return useQuery({
// //     queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus,
// //     queryFn: () => TeacherAttendanceAPI.getTodayCheckInStatus(),
// //     select: (data) => data.data,
// //     refetchOnWindowFocus: true, // Refetch when user returns to tab
// //     staleTime: 0, // Always consider data stale to get fresh status
// //     retry: 1,
// //   })
// // }

// // /**
// //  * Hook to manually check in for the day
// //  * Automatically invalidates check-in status after successful submission
// //  */
// // export const useManualCheckIn = () => {
// //   const qc = useQueryClient()

// //   return useMutation({
// //     mutationFn: (payload: ManualCheckInPayload) => {
// //       // console.log("🔄 [HOOK] Calling manualCheckIn with:", payload)
// //       return TeacherAttendanceAPI.manualCheckIn(payload)
// //     },
// //     onSuccess: (response) => {
// //       // console.log("✅ [HOOK] Check-in successful:", response)
// //       toast.success(response.message || "Check-in successful! Have a great day.")
// //       // Invalidate check-in status to refetch and show updated state
// //       qc.invalidateQueries({ queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus })
// //     },
// //     onError: (err) => {
// //       console.error("❌ [HOOK] Check-in error:", err)

// //       if (err instanceof AxiosError) {
// //         console.error("❌ [HOOK] Axios error details:", {
// //           message: err.message,
// //           status: err.response?.status,
// //           statusText: err.response?.statusText,
// //           data: err.response?.data,
// //           config: {
// //             url: err.config?.url,
// //             method: err.config?.method,
// //             data: err.config?.data,
// //           },
// //         })

// //         const errorMessage = err?.response?.data?.message || err?.message
// //         toast.error(errorMessage || "Failed to check in. Please try again.")
// //       } else {
// //         console.error("❌ [HOOK] Non-Axios error:", err)
// //         toast.error("An unexpected error occurred. Please try again.")
// //       }
// //     },
// //   })
// // }

// // /**
// //  * Hook to mark student attendance for a class
// //  * Note: This uses the existing AttendanceAPI.markDailyAttendance
// //  * Make sure to import: import { AttendanceAPI } from "@/lib/attendance"
// //  * @param classId - The class ID to mark attendance for
// //  */
// // export const useMarkStudentAttendance = (classId: string) => {
// //   const qc = useQueryClient()

// //   return useMutation({
// //     mutationFn: async (payload: {
// //       date: string
// //       attendance_records: Array<{
// //         student_id: string
// //         status: "PRESENT" | "ABSENT"
// //         notes?: string
// //       }>
// //     }) => {
// //       // Import AttendanceAPI from @/lib/attendance and use:
// //       return AttendanceAPI.markDailyAttendance({
// //         class_id: classId,
// //         date: payload.date,
// //         attendance_records: payload.attendance_records,
// //       })

// //       // Temporary placeholder to avoid unused variable warning
// //       // console.log("Marking attendance:", payload)
// //       throw new Error(
// //         "AttendanceAPI.markDailyAttendance not yet connected. Please uncomment the code above and import AttendanceAPI."
// //       )
// //     },
// //     onSuccess: () => {
// //       toast.success("Attendance marked successfully")
// //       // Invalidate relevant queries to refetch updated data
// //       qc.invalidateQueries({ queryKey: ["dailyAttendance", classId] })
// //     },
// //     onError: (err) => {
// //       if (err instanceof AxiosError) {
// //         toast.error(err?.response?.data?.message ?? "Failed to mark attendance")
// //       } else {
// //         toast.error("Failed to mark attendance")
// //       }
// //     },
// //   })
// // }

// "use client"

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { TeacherAttendanceAPI, ManualCheckInPayload } from "@/lib/teacher-attendance"
// import { toast } from "sonner"
// import { AxiosError } from "axios"

// // QUERY KEYS
// export const TEACHER_ATTENDANCE_KEYS = {
//   assignedClasses: (sessionId?: string) =>
//     sessionId ? ["teacher_assigned_classes", sessionId] : ["teacher_assigned_classes"],
//   checkInStatus: ["teacher_checkin_status"],
// }

// /**
//  * Hook to get classes assigned to the current teacher
//  * @param sessionId - Optional academic session ID (defaults to active session on backend)
//  */
// export const useGetTeacherAssignedClasses = (sessionId?: string) => {
//   return useQuery({
//     queryKey: TEACHER_ATTENDANCE_KEYS.assignedClasses(sessionId),
//     queryFn: () => TeacherAttendanceAPI.getAssignedClasses(sessionId),
//     refetchOnWindowFocus: false,
//     retry: 2,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   })
// }

// /**
//  * Hook to get today's check-in status for the current teacher
//  * Automatically refetches when window gains focus to ensure status is up-to-date
//  */
// export const useGetTodayCheckInStatus = () => {
//   return useQuery({
//     queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus,
//     queryFn: () => TeacherAttendanceAPI.getTodayCheckInStatus(),
//     select: (data) => data.data,
//     // refetchOnWindowFocus: true, // Ref
//     staleTime: 100, // Always conside
//     // retry: 1,
//   })
// }

// /**
//  * Hook to manually check in for the day
//  * Automatically invalidates check-in status after successful submission
//  */
// export const useManualCheckIn = () => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: (payload: ManualCheckInPayload) =>
//       TeacherAttendanceAPI.manualCheckIn(payload),
//     onSuccess: (response) => {
//       toast.success(response.message || "Check-in successful! Have a great day.")
//       // Invalidate check-in status to refetch and show updated state
//       qc.invalidateQueries({ queryKey: TEACHER_ATTENDANCE_KEYS.checkInStatus })
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         const errorMessage = err?.response?.data?.message || err?.message
//         toast.error(errorMessage || "Failed to check in. Please try again.")
//       } else {
//         toast.error("An unexpected error occurred. Please try again.")
//       }
//     },
//   })
// }

// /**
//  * Hook to mark student attendance for a class
//  * Note: This uses the existing AttendanceAPI.markDailyAttendance
//  * Make sure to import: import { AttendanceAPI } from "@/lib/attendance"
//  * @param classId - The class ID to mark attendance for
//  */
// export const useMarkStudentAttendance = (classId: string) => {
//   const qc = useQueryClient()

//   return useMutation({
//     mutationFn: async (payload: {
//       date: string
//       attendance_records: Array<{
//         student_id: string
//         status: "PRESENT" | "ABSENT"
//         notes?: string
//       }>
//     }) => {
//       // Import AttendanceAPI from @/lib/attendance and use:
//       // return AttendanceAPI.markDailyAttendance({
//       //   class_id: classId,
//       //   date: payload.date,
//       //   attendance_records: payload.attendance_records,
//       // })

//       // Temporary placeholder to avoid unused variable warning
//       // console.log("Marking attendance:", payload)
//       throw new Error(
//         "AttendanceAPI.markDailyAttendance not yet connected. Please uncomment the code above and import AttendanceAPI."
//       )
//     },
//     onSuccess: () => {
//       toast.success("Attendance marked successfully")
//       // Invalidate relevant queries to refetch updated data
//       qc.invalidateQueries({ queryKey: ["dailyAttendance", classId] })
//     },
//     onError: (err) => {
//       if (err instanceof AxiosError) {
//         toast.error(err?.response?.data?.message ?? "Failed to mark attendance")
//       } else {
//         toast.error("Failed to mark attendance")
//       }
//     },
//   })
// }
