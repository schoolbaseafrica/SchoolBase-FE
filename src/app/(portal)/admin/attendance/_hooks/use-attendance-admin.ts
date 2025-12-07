"use client"

import { useQuery } from "@tanstack/react-query"
import { AttendanceAPI, AttendanceResponse } from "@/lib/attendance"

export const useDailyAttendance = (classId: string, date?: string) => {
  return useQuery({
    queryKey: ["dailyAttendance", classId, date],
    queryFn: (): Promise<AttendanceResponse> =>
      AttendanceAPI.getDailyAttendanceByClass(
        classId,
        date || new Date().toISOString().split("T")[0]
      ),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
