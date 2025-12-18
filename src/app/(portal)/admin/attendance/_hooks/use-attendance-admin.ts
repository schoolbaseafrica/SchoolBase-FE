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
        // Check if res has nested structure or returned directly
        return res
      } finally {
        setLoading(false)
      }
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
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
