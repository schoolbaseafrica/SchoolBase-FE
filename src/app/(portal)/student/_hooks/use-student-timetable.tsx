"use client"

import { useQuery } from "@tanstack/react-query"
import { TimetableAPI, TimetableResponse } from "@/lib/timetable"

/**
 * Hook for fetching student class timetable
 */
export function useGetClassTimetable(classId?: string) {
  return useQuery<TimetableResponse, Error>({
    queryKey: ["student-timetable", classId],
    queryFn: async () => {
      if (!classId) throw new Error("Class ID is required")
      console.log("[useGetClassTimetable] Fetching timetable for classId:", classId)
      const response = await TimetableAPI.getClassTimetable(classId)
      console.log("[useGetClassTimetable] Timetable response:", {
        schedulesCount: response.data?.schedules?.length || 0,
        schedules: response.data?.schedules,
      })
      return response.data
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}
