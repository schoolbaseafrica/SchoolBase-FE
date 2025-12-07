"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ResultsAPI } from "@/lib/results"
import type {
  Grade,
  CreateSubmissionRequest,
  GradeSubmission,
  GetGradesParams,
} from "@/types/result"
import { toast } from "sonner"

const RESULTS_KEY = ["results"]

export function useGetClasses() {
  return useQuery({
    queryKey: [...RESULTS_KEY, "classes"],
    queryFn: () => ResultsAPI.getClasses(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetSubjects(classId?: string) {
  return useQuery({
    queryKey: [...RESULTS_KEY, "subjects", classId],
    queryFn: () => ResultsAPI.getSubjects(),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetTerms(sessionId?: string) {
  return useQuery({
    queryKey: [...RESULTS_KEY, "terms", sessionId],
    queryFn: () => ResultsAPI.getTerms(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetStudents(classId?: string, subjectId?: string) {
  return useQuery({
    queryKey: [...RESULTS_KEY, "students", classId, subjectId],
    queryFn: () => {
      if (!classId) return Promise.resolve([])
      return ResultsAPI.getStudentsForGradeEntry(classId)
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetGradingScale() {
  return useQuery({
    queryKey: [...RESULTS_KEY, "grading-scale"],
    queryFn: () => ResultsAPI.getGradingScale(),
    staleTime: 1000 * 60 * 60,
  })
}

export function useGetTeacherSubmissions(params?: GetGradesParams) {
  return useQuery({
    queryKey: [...RESULTS_KEY, "submissions", params],
    queryFn: () => ResultsAPI.getTeacherSubmissions(params),
    staleTime: 1000 * 60 * 5,
    // Add retry logic
    retry: 2,
    // Add refetch on window focus to catch updates
    refetchOnWindowFocus: true,
  })
}

// Add a dedicated hook for getting specific submission
export function useGetSubmissionByFilters(
  classId?: string,
  subjectId?: string,
  termId?: string
) {
  return useQuery({
    queryKey: [...RESULTS_KEY, "submission-by-filters", classId, subjectId, termId],
    queryFn: () => {
      if (!classId || !subjectId || !termId) return null

      return ResultsAPI.getTeacherSubmissions({
        class_id: classId,
        subject_id: subjectId,
        term_id: termId,
      }).then((submissions) => {
        // Return the first matching submission, if any
        return submissions.find(
          (sub) =>
            sub.class_id === classId &&
            sub.subject_id === subjectId &&
            sub.term_id === termId
        )
      })
    },
    enabled: !!classId && !!subjectId && !!termId,
    staleTime: 1000 * 60 * 5,
    // Don't retry too much to avoid unnecessary requests
    retry: 1,
  })
}

export function useSaveDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) => ResultsAPI.createSubmission(data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [...RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({
        queryKey: [...RESULTS_KEY, "submission-by-filters"],
      })
      toast.success("Draft saved successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save draft")
    },
  })
}

export function useSubmitForApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (submissionId: string) => ResultsAPI.submitSubmission(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({
        queryKey: [...RESULTS_KEY, "submission-by-filters"],
      })
      toast.success("Submitted for approval successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit for approval")
    },
  })
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GradeSubmission> }) =>
      ResultsAPI.updateSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({
        queryKey: [...RESULTS_KEY, "submission-by-filters"],
      })
      toast.success("Submission updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update submission")
    },
  })
}

export function useUpdateGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gradeId, data }: { gradeId: string; data: Partial<Grade> }) =>
      ResultsAPI.updateGrade(gradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({
        queryKey: [...RESULTS_KEY, "submission-by-filters"],
      })
      toast.success("Grade updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update grade")
    },
  })
}
