"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AcademicTerm,
  AcademicTermAPI,
  CreateAcademicTermData,
  PaginatedTerms,
  UpdateAcademicTermData,
} from "@/lib/academic-term"

const ACADEMIC_TERMS_KEY = ["academic-terms"]
const ACTIVE_TERM_KEY = ["academic-term", "active"]

export function useCreateAcademicTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAcademicTermData) => AcademicTermAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_TERMS_KEY })
      queryClient.invalidateQueries({ queryKey: ACTIVE_TERM_KEY })
    },
  })
}

export function useAcademicTerms(params?: { page?: number; limit?: number }) {
  return useQuery<PaginatedTerms>({
    queryKey: [ACADEMIC_TERMS_KEY[0], params?.page ?? 1, params?.limit ?? 20],
    queryFn: () => AcademicTermAPI.list(params),
    refetchOnWindowFocus: false,
  })
}

export function useAcademicTerm(id?: string) {
  return useQuery<AcademicTerm>({
    queryKey: ["academic-term", id],
    queryFn: () => AcademicTermAPI.getOne(id ?? ""),
    enabled: Boolean(id),
  })
}

// Fixed hook to get terms by session ID
export function useAcademicTermsForSession(sessionId?: string) {
  return useQuery<AcademicTerm[]>({
    queryKey: ["academic-terms", "session", sessionId],
    queryFn: () => AcademicTermAPI.getBySession(sessionId!),
    enabled: Boolean(sessionId),
    refetchOnWindowFocus: false,
  })
}

export function useActiveAcademicTerm() {
  return useQuery<AcademicTerm>({
    queryKey: ACTIVE_TERM_KEY,
    queryFn: () => AcademicTermAPI.getActive(),
    refetchOnWindowFocus: false,
    staleTime: 20 * 60 * 1000, // 20 minutes
  })
}

export function useActivateAcademicTerm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AcademicTermAPI.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_TERMS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-term", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_TERM_KEY })
    },
  })
}

export function useDeleteAcademicTerm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AcademicTermAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_TERMS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-term", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_TERM_KEY })
    },
  })
}

export function useUpdateAcademicTerm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicTermData }) =>
      AcademicTermAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_TERMS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-term", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_TERM_KEY })
    },
  })
}
