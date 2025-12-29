"use client"

import { useQuery } from "@tanstack/react-query"
import { TeacherDashboardAPI } from "@/lib/api/teacher-dashboard"

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => TeacherDashboardAPI.getTodaysClasses(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
