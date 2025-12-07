// hooks/useAttendance.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  AttendanceAPI,
  SubmitAttendancePayload,
  //   SubmitAttendanceResponse,
  AttendanceRecord,
} from "@/lib/attendance"

// ----------------------------
// ✅ Fetch attendance by class and date (optional for pre-filling)
// ----------------------------
export const useAttendance = (classId: string, date?: string) => {
  const selectedDate = date || format(new Date(), "yyyy-MM-dd")

  return useQuery({
    queryKey: ["attendance", classId, selectedDate],
    queryFn: async () => {
      // Placeholder: you can add a GET /attendance endpoint here if exists
      // For now we just return empty records
      return {
        date: selectedDate,
        attendance_records: [] as AttendanceRecord[],
      }
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// ✅ Submit daily attendance
// ----------------------------
export const useSubmitAttendance = (classId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitAttendancePayload) =>
      AttendanceAPI.markDailyAttendance(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", classId, payload.date] })
    },
  })
}

// "use client"

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { format } from "date-fns"
// import {
//   AttendanceAPI,
//   SubmitAttendancePayload,
//   SubmitAttendanceResponse,
// } from "@/lib/api/attendance"

// /* ---------------- TYPES ---------------- */

// export interface Student {
//   id: string
//   name: string
//   present: boolean
// }

// export interface AttendanceResponse {
//   date: string
//   submitted: boolean
//   submittedAt?: string
//   students: Student[]
// }

// /* ---------------- API CALLS ---------------- */

// // Fetch attendance for a class and date
// const fetchAttendance = async (
//   classId: string,
//   date: string
// ): Promise<AttendanceResponse> => {
//   // If you have a GET endpoint for attendance, call it here
//   // Example using apiFetch directly:
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const isToday = format(new Date(), "yyyy-MM-dd") === date
//       resolve({
//         date,
//         submitted: !isToday && Math.random() > 0.5,
//         submittedAt: !isToday ? "08:32 AM" : undefined,
//         students: [
//           { id: "1", name: "John Alex", present: Math.random() > 0.5 },
//           { id: "2", name: "Mary Jonah", present: Math.random() > 0.5 },
//           { id: "3", name: "Samuel Victor", present: Math.random() > 0.5 },
//         ],
//       })
//     }, 700)
//   })
// }

// /* ---------------- HOOKS ---------------- */

// // Fetch attendance
// export const useAttendance = (classId: string, date?: string) => {
//   const selectedDate = date || format(new Date(), "yyyy-MM-dd")

//   return useQuery({
//     queryKey: ["attendance", classId, selectedDate],
//     queryFn: () => fetchAttendance(classId, selectedDate),
//     enabled: !!classId,
//   })
// }

// // Submit attendance
// export const useSubmitAttendance = (classId: string) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (payload: SubmitAttendancePayload) =>
//       AttendanceAPI.markDailyAttendance(payload),
//     onSuccess: (_, payload) => {
//       // Refetch attendance for that date after successful submission
//       queryClient.invalidateQueries(["attendance", classId, payload.date])
//     },
//   })
// }

// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// // import { format } from "date-fns"

// // // Fetch attendance hook
// // export const useAttendance = (classId: string, date?: string) => {
// //   const selectedDate = date || format(new Date(), "yyyy-MM-dd")

// //   return useQuery({
// //     queryKey: ["attendance", classId, selectedDate],
// //     queryFn: () => fetchAttendance(classId, selectedDate),
// //     enabled: !!classId, // don't run if classId is empty
// //   })
// // }

// // // Submit attendance hook
// // export const useSubmitAttendance = (classId: string) => {
// //   const queryClient = useQueryClient()

// //   return useMutation({
// //     mutationFn: (payload: SubmitAttendancePayload) => submitAttendance(payload),
// //     onSuccess: (_, payload) => {
// //       // invalidate query for this class and date to refetch updated data
// //       queryClient.invalidateQueries(["attendance", classId, payload.date])
// //     },
// //   })
// // }
