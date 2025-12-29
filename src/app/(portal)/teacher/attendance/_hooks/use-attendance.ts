// hooks/useAttendance.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/error-handler"
import {
  AttendanceAPI,
  SubmitAttendancePayload,
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
      toast.success("Attendance marked successfully")
      queryClient.invalidateQueries({ queryKey: ["attendance", classId, payload.date] })
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error) || "Failed to mark attendance")
    },
  })
}
