"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AcademicSession,
  AcademicSessionAPI,
  CreateAcademicSessionData,
  PaginatedSessions,
  UpdateAcademicSessionData,
} from "@/lib/academic-session"

const ACADEMIC_SESSIONS_KEY = ["academic-sessions"]
const ACTIVE_SESSION_KEY = ["academic-session", "active"]

export function useCreateAcademicSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAcademicSessionData) => AcademicSessionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_SESSIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}

export function useAcademicSessions(params?: { page?: number; limit?: number }) {
  return useQuery<PaginatedSessions>({
    queryKey: [ACADEMIC_SESSIONS_KEY[0], params?.page ?? 1, params?.limit ?? 20],
    queryFn: () => AcademicSessionAPI.list(params),
    refetchOnWindowFocus: false,
  })
}

export function useAcademicSession(id?: string) {
  return useQuery<AcademicSession>({
    queryKey: ["academic-session", id],
    queryFn: () => AcademicSessionAPI.getOne(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useActiveAcademicSession() {
  return useQuery<AcademicSession>({
    queryKey: ACTIVE_SESSION_KEY,
    queryFn: () => AcademicSessionAPI.getActive(),
    refetchOnWindowFocus: false,
    staleTime: 20 * 60 * 1000, // 20 minutes
  })
}

export function useActivateAcademicSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AcademicSessionAPI.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_SESSIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-session", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}

export function useActiveAcademicSessionFromList() {
  const { data, isLoading, isError } = useAcademicSessions()

  const active = data?.data.find(
    (session) => session.isActive || session.status === "Active"
  )

  return {
    data: active,
    isLoading,
    isError,
  }
}

export function useDeleteAcademicSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AcademicSessionAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_SESSIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-session", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}

export function useUpdateAcademicSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicSessionData }) =>
      AcademicSessionAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_SESSIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ["academic-session", id] })
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}
