"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ResultsAPI } from "@/lib/results"
import { toast } from "sonner"

const ADMIN_RESULTS_KEY = ["admin", "results"]

export function useGetAdminSubmissions(params?: { status?: string }) {
  return useQuery({
    queryKey: [...ADMIN_RESULTS_KEY, "submissions", params],
    queryFn: () => ResultsAPI.getAdminSubmissions(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetSubmissionStats() {
  return useQuery({
    queryKey: [...ADMIN_RESULTS_KEY, "stats"],
    queryFn: async () => {
      const submissions = await ResultsAPI.getAdminSubmissions()

      const total = submissions.length
      const pending = submissions.filter((s) => s.status === "submitted").length
      const approved = submissions.filter((s) => s.status === "approved").length
      const rejected = submissions.filter((s) => s.status === "rejected").length

      return { total, pending, approved, rejected }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetSubmission(id: string) {
  return useQuery({
    queryKey: [...ADMIN_RESULTS_KEY, "submission", id],
    queryFn: () => ResultsAPI.getSubmission(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useApproveSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ResultsAPI.approveSubmission(id, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({ queryKey: [...ADMIN_RESULTS_KEY, "stats"] })
      toast.success("Submission approved successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve submission")
    },
  })
}

export function useRejectSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ResultsAPI.rejectSubmission(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_RESULTS_KEY, "submissions"] })
      queryClient.invalidateQueries({ queryKey: [...ADMIN_RESULTS_KEY, "stats"] })
      toast.success("Submission rejected successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject submission")
    },
  })
}
