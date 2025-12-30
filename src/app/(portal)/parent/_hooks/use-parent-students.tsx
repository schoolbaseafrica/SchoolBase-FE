"use client"
import { ParentStudents } from "@/lib/parents/client"
import { useQuery } from "@tanstack/react-query"
import { useParentAuth } from "@/hooks/use-auth-user"
import { getStudentResults, getActiveTerm } from "@/lib/results"
import { TimetableAPI, TimetableResponse } from "@/lib/timetable"
import { FeesAPI, StudentFeeDetailsResponse } from "@/lib/fees"

export const PARENT_STUDENTS_KEY = ["parent-students"]

export function useGetParentStudents() {
  const { isParent, isLoading: isLoadingAuth } = useParentAuth()

  return useQuery({
    queryKey: PARENT_STUDENTS_KEY,
    queryFn: () => ParentStudents.getAll(),
    select: (data) => {
      // Extract the array from the wrapped response
      // Handle both wrapped { data: Student[] } and direct Student[] formats
      if (data && typeof data === "object" && "data" in data) {
        return Array.isArray(data.data) ? data.data : []
      }
      return Array.isArray(data) ? data : []
    },
    enabled: isParent && !isLoadingAuth, // Only fetch if user is a parent
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Get student profile (includes class info)
export function useGetStudentProfile(studentId?: string) {
  const { parentId } = useParentAuth()

  return useQuery({
    queryKey: [...PARENT_STUDENTS_KEY, "profile", studentId],
    queryFn: () => {
      if (!parentId || !studentId)
        throw new Error("Parent ID and Student ID are required")
      return ParentStudents.getStudentProfile(parentId, studentId)
    },
    enabled: !!parentId && !!studentId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Get monthly attendance
export function useGetMonthlyAttendance(registrationNumber?: string) {
  return useQuery({
    queryKey: [...PARENT_STUDENTS_KEY, "attendance", registrationNumber],
    queryFn: () => {
      if (!registrationNumber) throw new Error("Registration number is required")
      return ParentStudents.getMonthlyAttendance(registrationNumber)
    },
    enabled: !!registrationNumber,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Get latest result for grade
export function useGetLatestResult(studentId?: string) {
  const activeTermQuery = useQuery({
    queryKey: ["active-term"],
    queryFn: () => getActiveTerm(),
    staleTime: 1000 * 60 * 5,
  })

  return useQuery({
    queryKey: [
      ...PARENT_STUDENTS_KEY,
      "latest-result",
      studentId,
      activeTermQuery.data?.id,
    ],
    queryFn: async () => {
      if (!studentId || !activeTermQuery.data?.id)
        throw new Error("Student ID and active term are required")
      const results = await getStudentResults(studentId, activeTermQuery.data.id)
      // Return the most recent result
      return results.length > 0 ? results[0] : null
    },
    enabled: !!studentId && !!activeTermQuery.data?.id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Get timetable for a class
export function useGetClassTimetable(classId?: string) {
  return useQuery<TimetableResponse, Error>({
    queryKey: [...PARENT_STUDENTS_KEY, "timetable", classId],
    queryFn: async () => {
      if (!classId) throw new Error("Class ID is required")
      const response = await TimetableAPI.getClassTimetable(classId)
      return response.data
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Get student fee details (for current active term)
export function useGetStudentFeeDetails(studentId?: string, sessionId?: string) {
  const activeTermQuery = useQuery({
    queryKey: ["active-term"],
    queryFn: () => getActiveTerm(),
    staleTime: 1000 * 60 * 5,
  })

  // If sessionId is not provided, try to get active academic session as fallback
  const activeSessionQuery = useQuery({
    queryKey: ["active-academic-session"],
    queryFn: async () => {
      const { AcademicSessionAPI } = await import("@/lib/academic-session")
      return AcademicSessionAPI.getActive()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !sessionId && !!studentId && !!activeTermQuery.data?.id, // Only fetch if sessionId is missing
  })

  // Use provided sessionId or fallback to active session
  const effectiveSessionId = sessionId || activeSessionQuery.data?.id

  return useQuery({
    queryKey: [
      ...PARENT_STUDENTS_KEY,
      "fee-details",
      studentId,
      activeTermQuery.data?.id,
      effectiveSessionId,
    ],
    queryFn: async () => {
      if (!studentId || !activeTermQuery.data?.id || !effectiveSessionId) {
        throw new Error("Student ID, term ID, and session ID are required")
      }
      console.log("[useGetStudentFeeDetails] Fetching fee details:", {
        studentId,
        termId: activeTermQuery.data.id,
        sessionId: effectiveSessionId,
        sessionSource: sessionId ? "student-profile" : "active-session",
      })
      const response = await FeesAPI.getStudentFeeDetails(studentId, {
        term_id: activeTermQuery.data.id,
        session_id: effectiveSessionId,
      })

      console.log("[useGetStudentFeeDetails] Raw API response:", {
        status_code: response?.status_code,
        message: response?.message,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        dataKeys: response?.data ? Object.keys(response?.data) : [],
        dataValue: response?.data ? JSON.parse(JSON.stringify(response.data)) : null, // Show actual data content
        fullResponse: JSON.parse(JSON.stringify(response)), // Deep clone for logging
      })

      // Check if data is nested incorrectly
      if (response?.data && typeof response.data === "object") {
        const dataKeys = Object.keys(response.data)
        const responseData = response.data as any // Type assertion for dynamic key access
        console.log("[useGetStudentFeeDetails] Data structure analysis:", {
          dataKeys,
          firstKey: dataKeys[0],
          firstKeyValue: dataKeys[0]
            ? JSON.parse(JSON.stringify(responseData[dataKeys[0]]))
            : null,
          isArray: Array.isArray(response.data),
          isNestedResponsePack:
            (responseData as any).status_code !== undefined &&
            (responseData as any).data !== undefined,
        })
      }

      // Response structure: ResponsePack<StudentFeeDetailsResponse>
      // Return the full response object so we can access .data.data.data like admin does
      return response
    },
    enabled:
      !!studentId &&
      !!activeTermQuery.data?.id &&
      !!effectiveSessionId &&
      !activeSessionQuery.isLoading,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useGetExtraDummy() {
  return useQuery({
    queryKey: [...PARENT_STUDENTS_KEY, "dummy-extras"],
    queryFn: () => ParentStudents.getDummyExtras(),
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
