"use client"

import { useQuery } from "@tanstack/react-query"
import { TeacherDashboardAPI } from "@/lib/api/teacher-dashboard"
import { useTeacherAuth } from "@/hooks/use-auth-user"

export function useTeacherDashboard() {
  const { isTeacher, isLoading: isLoadingAuth } = useTeacherAuth()

  return useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: () => TeacherDashboardAPI.getTodaysClasses(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isTeacher && !isLoadingAuth, // Only fetch if user is a teacher
  })
}
