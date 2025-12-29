"use client"

import { useQuery } from "@tanstack/react-query"
import { AttendanceAPI, AttendanceResponse } from "@/lib/attendance"
import { useAttendanceStore } from "@/store/attendance-store"
import { useEffect } from "react"

export const useDailyAttendance = (classId: string, date?: string) => {
  const setAttendance = useAttendanceStore((state) => state.setAttendance)
  const setLoading = useAttendanceStore((state) => state.setLoading)
  // const setError = useAttendanceStore((state) => state.setError)

  const effectiveDate = date || new Date().toISOString().split("T")[0]

  const query = useQuery({
    queryKey: ["dailyAttendance", classId, effectiveDate],
    queryFn: async (): Promise<AttendanceResponse> => {
      setLoading(true)
      try {
        const res = await AttendanceAPI.getDailyAttendanceByClass(classId, effectiveDate)
        // Handle wrapped response (backend returns { message, data: {...} })
        // apiFetch returns res.data, so if wrapped, access res.data.data, otherwise res.data is the data itself
        if (res && typeof res === "object") {
          // Check if it's the direct response structure (has class_id)
          if ("class_id" in res) {
            return res as AttendanceResponse
          }
          // Otherwise, it might be wrapped (has data property)
          if ("data" in res && res.data) {
            return res.data as AttendanceResponse
          }
        }
        return res as AttendanceResponse
      } catch (error: any) {
        // Handle 404 as empty state (no students enrolled)
        // Check multiple possible error structures (Axios error, custom error, etc.)
        const statusCode = error?.response?.status || error?.status || error?.status_code
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          error?.response?.data?.error ||
          ""

        if (
          statusCode === 404 &&
          errorMessage.toLowerCase().includes("no students enrolled")
        ) {
          // Return empty attendance response for classes with no students
          // This prevents React Query from treating it as an error
          return {
            class_id: classId,
            date: effectiveDate,
            students: [],
            summary: {
              total_students: 0,
              present_count: 0,
              absent_count: 0,
              late_count: 0,
              excused_count: 0,
              half_day_count: 0,
              not_marked_count: 0,
            },
          }
        }
        throw error
      } finally {
        setLoading(false)
      }
    },
    enabled: !!classId,
    staleTime: 30 * 1000, // Reduced to 30 seconds for more responsive updates
    refetchInterval: 30 * 1000, // Poll every 30 seconds to catch NFC updates
    refetchIntervalInBackground: false, // Only poll when tab is active
    retry: 1,
  })

  useEffect(() => {
    if (query.data && classId) {
      if (query.data.students && query.data.summary) {
        setAttendance(classId, effectiveDate, query.data.students, query.data.summary)
      }
    }
  }, [query.data, classId, effectiveDate, setAttendance])

  return query
}
