"use client"
import { ParentStudents } from "@/lib/parents/client"
import { useQuery } from "@tanstack/react-query"
import { useParentAuth } from "@/hooks/use-auth-user"
import { getStudentResults, getActiveTerm } from "@/lib/results"
import { TimetableAPI, TimetableResponse } from "@/lib/timetable"
import { FeesAPI } from "@/lib/fees"

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
export function useGetMonthlyAttendance(
  registrationNumber?: string,
  sessionId?: string,
  year?: number,
  month?: number
) {
  return useQuery({
    queryKey: [
      ...PARENT_STUDENTS_KEY,
      "attendance",
      registrationNumber,
      sessionId,
      year,
      month,
    ],
    queryFn: () => {
      if (!registrationNumber) throw new Error("Registration number is required")
      return ParentStudents.getMonthlyAttendance(
        registrationNumber,
        sessionId,
        year,
        month
      )
    },
    enabled: !!registrationNumber && !!sessionId && !!year && !!month,
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
export function useGetStudentFeeDetails(
  studentId?: string,
  sessionId?: string,
  termId?: string
) {
  return useQuery({
    queryKey: [...PARENT_STUDENTS_KEY, "fee-details", studentId, termId, sessionId],
    queryFn: async () => {
      if (!studentId || !termId || !sessionId) {
        throw new Error("Student ID, term ID, and session ID are required")
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

export function useGetExtraDummy() {
  return useQuery({
    queryKey: [...PARENT_STUDENTS_KEY, "dummy-extras"],
    queryFn: () => ParentStudents.getDummyExtras(),
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
