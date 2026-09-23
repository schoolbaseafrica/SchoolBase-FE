"use client"

import { useQuery } from "@tanstack/react-query"
import { FeesAPI, StudentFeeDetailsResponse, ResponsePack } from "@/lib/fees"

export function useGetStudentFeeDetails(
  studentId?: string,
  termId?: string,
  sessionId?: string
) {
  return useQuery<ResponsePack<StudentFeeDetailsResponse>, Error>({
    queryKey: ["student-fee-details", studentId, termId, sessionId],
    queryFn: async () => {
      if (!studentId || !termId || !sessionId) {
        throw new Error("Student, session and term are required")
      }
      return FeesAPI.getStudentFeeDetails(studentId, {
        term_id: termId,
        session_id: sessionId,
      })
    },
    enabled: !!studentId && !!termId && !!sessionId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
