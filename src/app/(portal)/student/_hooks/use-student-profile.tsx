"use client"

import { useQuery } from "@tanstack/react-query"
import { StudentsAPI } from "@/lib/students/client"
import { useStudentAuth } from "@/hooks/use-auth-user"

/**
 * Shared hook for fetching student profile data across all student pages.
 * This ensures consistent data fetching and caching.
 */
export function useStudentProfile() {
  const { studentId } = useStudentAuth()

  return useQuery({
    queryKey: ["student-profile", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required")
      console.log("[useStudentProfile] Fetching profile for studentId:", studentId)
      const profile = await StudentsAPI.getStudentProfile(studentId)
      console.log("[useStudentProfile] Profile response:", profile)
      console.log("[useStudentProfile] Profile class_details:", profile?.class_details)
      console.log(
        "[useStudentProfile] Profile academic_details:",
        profile?.academic_details
      )
      if (!profile?.class_details) {
        console.warn(
          "[useStudentProfile] WARNING: class_details is missing/null/undefined in profile response"
        )
      }
      return profile
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}
