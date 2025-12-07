// File: app/(portal)/parent/results/_hooks/use-parent-results.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { getParentLinkedStudents, getStudentResults, getActiveTerm } from "@/lib/results"
import type { StudentResultResponse } from "@/types/result"

const PARENT_RESULTS_KEY = ["parent-results"]

// Get linked students for parent
export function useGetLinkedStudents() {
  return useQuery({
    queryKey: [...PARENT_RESULTS_KEY, "linked-students"],
    queryFn: () => getParentLinkedStudents(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    // Ensure we always return an array
    initialData: [],
  })
}

// Get active term
export function useGetActiveTerm() {
  return useQuery({
    queryKey: [...PARENT_RESULTS_KEY, "active-term"],
    queryFn: () => getActiveTerm(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Get results for a specific student
export function useGetStudentResults(studentId?: string) {
  const { data: activeTerm } = useGetActiveTerm()

  return useQuery({
    queryKey: [...PARENT_RESULTS_KEY, "student-results", studentId, activeTerm?.id],
    queryFn: () => {
      if (!studentId) throw new Error("Student ID is required")
      return getStudentResults(studentId, activeTerm?.id)
    },
    enabled: !!studentId && !!activeTerm?.id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    select: (results: StudentResultResponse[]) => {
      // Transform to your existing StudentResult format
      return results.map((result) => ({
        id: result.id,
        student_id: result.student.id,
        class_id: result.class.id,
        class_name: `${result.class.name}${result.class.arm ? ` ${result.class.arm}` : ""}`,
        term_id: result.term.id,
        term_name: result.term.name,
        academic_session_id: result.academicSession.id,
        academic_session_name: result.academicSession.name,
        total_score: result.total_score,
        average_score: result.average_score,
        grade_letter: result.grade_letter,
        position: result.position,
        remark: result.remark,
        subject_count: result.subject_count,
        generated_at: result.generated_at,
        subjects: result.subject_lines.map((subject) => ({
          id: subject.id,
          result_id: result.id,
          subject_id: subject.subject.id,
          subject_name: subject.subject.name,
          ca_score: subject.ca_score,
          exam_score: subject.exam_score,
          total_score: subject.total_score,
          grade_letter: subject.grade_letter,
          remark: subject.remark,
        })),
      }))
    },
  })
}
