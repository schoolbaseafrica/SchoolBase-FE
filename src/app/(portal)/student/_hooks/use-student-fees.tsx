"use client"

import { useQuery } from "@tanstack/react-query"
import { FeesAPI, StudentFeeDetailsResponse, ResponsePack } from "@/lib/fees"
import { getActiveTerm } from "@/lib/results"
import { useStudentProfile } from "./use-student-profile"

export function useGetStudentFeeDetails(
  studentId?: string,
  termId?: string,
  sessionId?: string
) {
  // If termId is not provided, fetch active term
  const { data: activeTerm, isLoading: isLoadingTerm } = useQuery({
    queryKey: ["active-term"],
    queryFn: () => getActiveTerm(),
    enabled: !termId,
    staleTime: 1000 * 60 * 5,
  })

  // Fetch student profile to get session ID if not provided
  // Note: useStudentProfile uses the studentId from useStudentAuth internally
  const { data: studentProfile } = useStudentProfile()

  const finalTermId = termId || activeTerm?.id
  const finalSessionId = sessionId || studentProfile?.academic_details?.id

  // Debug logging
  if (studentId && !isLoadingTerm) {
    console.log("useGetStudentFeeDetails Hook State:", {
      studentId,
      termId,
      sessionId,
      activeTermId: activeTerm?.id,
      studentProfile: studentProfile ? JSON.parse(JSON.stringify(studentProfile)) : null, // Deep clone to see full object
      studentProfileAcademicDetails: studentProfile?.academic_details,
      studentProfileSessionId: studentProfile?.academic_details?.id,
      finalTermId,
      finalSessionId,
      enabled: !!studentId && !!finalTermId && !!finalSessionId,
      allConditionsMet: {
        hasStudentId: !!studentId,
        hasFinalTermId: !!finalTermId,
        hasFinalSessionId: !!finalSessionId,
      },
    })
  }

  return useQuery<ResponsePack<StudentFeeDetailsResponse>, Error>({
    queryKey: ["student-fee-details", studentId, finalTermId, finalSessionId],
    queryFn: async () => {
      if (!studentId || !finalTermId || !finalSessionId) {
        const errorMsg = `Missing required parameters: studentId=${!!studentId}, termId=${!!finalTermId}, sessionId=${!!finalSessionId}`
        console.error("useGetStudentFeeDetails Error:", errorMsg)
        throw new Error(errorMsg)
      }

      console.log("Fetching student fee details with:", {
        studentId,
        term_id: finalTermId,
        session_id: finalSessionId,
      })

      const response = await FeesAPI.getStudentFeeDetails(studentId, {
        term_id: finalTermId,
        session_id: finalSessionId,
      })

      console.log("Student fee details response:", response)
      console.log("Response structure:", {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataValues: response.data
          ? Object.keys(response.data).map((key) => ({
              key,
              value: (response.data as any)[key],
              valueType: typeof (response.data as any)[key],
              isArray: Array.isArray((response.data as any)[key]),
            }))
          : [],
        fullResponse: JSON.parse(JSON.stringify(response)),
      })
      // The response is ResponsePack<StudentFeeDetailsResponse> = { status_code, message, data: StudentFeeDetailsResponse }
      // Return the full response object like parent hook does, so page can handle double-wrapping
      return response
    },
    enabled: !!studentId && !!finalTermId && !!finalSessionId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
