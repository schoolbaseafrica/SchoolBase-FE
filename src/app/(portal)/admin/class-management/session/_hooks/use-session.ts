"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AcademicSession,
  AcademicSessionAPI,
  CreateAcademicSessionData,
  PaginatedSessions,
  UpdateAcademicSessionData,
} from "@/lib/academic-session"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

const ACADEMIC_SESSIONS_KEY = ["academic-sessions"]
const ACTIVE_SESSION_KEY = ["academic-session", "active"]

export function useCreateAcademicSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAcademicSessionData) => AcademicSessionAPI.create(data),
    onSuccess: async () => {
      // Invalidate and refetch all session-related queries
      await queryClient.invalidateQueries({ 
        queryKey: ACADEMIC_SESSIONS_KEY,
        refetchType: "active" 
      })
      await queryClient.invalidateQueries({ 
        queryKey: ACTIVE_SESSION_KEY,
        refetchType: "active" 
      })
      // Force refetch to ensure data is fresh
      await queryClient.refetchQueries({ 
        queryKey: ACADEMIC_SESSIONS_KEY,
        type: "active" 
      })
    },
  })
}

export function useAcademicSessions(params?: { page?: number; limit?: number }) {
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery<PaginatedSessions>({
    queryKey: [ACADEMIC_SESSIONS_KEY[0], params?.page ?? 1, params?.limit ?? 20],
    queryFn: () => AcademicSessionAPI.list(params),
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    staleTime: 0, // Consider data stale immediately to allow refetching
    gcTime: 0, // Don't cache - always fetch fresh data
    enabled: !isSuperAdmin, // Disable for super admin
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
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery<AcademicSession | null>({
    queryKey: ACTIVE_SESSION_KEY,
    queryFn: async () => {
      return await AcademicSessionAPI.getActive()
    },
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider stale to allow immediate refetch after activation
    refetchOnMount: true, // Always refetch when component mounts
    enabled: !isSuperAdmin, // Disable for super admin
    retry: (failureCount, error: any) => {
      // Don't retry if the result is null (no active session)
      // or if error message indicates 404
      if (
        error === null ||
        error?.message?.includes("404") ||
        error?.message?.includes("Not Found") ||
        error?.message?.includes("No active session")
      ) {
        return false
      }
      // Retry other errors up to 3 times
      return failureCount < 3
    },
  })
}

export function useActivateAcademicSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AcademicSessionAPI.activate(id),
    onSuccess: async (data, id) => {
      console.log("Mutation onSuccess - data:", data) // Debug log
      console.log("Mutation onSuccess - status:", data?.status) // Debug log
      
      // Invalidate all related queries first
      await queryClient.invalidateQueries({ 
        queryKey: ACADEMIC_SESSIONS_KEY,
        exact: false,
      })
      await queryClient.invalidateQueries({ 
        queryKey: ["academic-session", id],
      })
      await queryClient.invalidateQueries({ 
        queryKey: ACTIVE_SESSION_KEY,
      })
      
      console.log("Queries invalidated, now refetching...") // Debug log
      
      // Force refetch active session FIRST (most important - other components depend on this)
      await queryClient.refetchQueries({ 
        queryKey: ACTIVE_SESSION_KEY,
      })
      
      // Then refetch sessions list
      await queryClient.refetchQueries({ 
        queryKey: ACADEMIC_SESSIONS_KEY,
        exact: false,
      })
      
      // Invalidate AND refetch queries that depend on active session (classes, terms, etc.)
      // This ensures they refetch with the new active session immediately
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: ["classes"],
          exact: false,
        }),
        queryClient.refetchQueries({ 
          queryKey: ["academic-terms"],
          exact: false,
        }),
      ])
      
      console.log("Queries refetched successfully") // Debug log
    },
  })
}

export function useActiveAcademicSessionFromList() {
  const { data, isLoading, isError } = useAcademicSessions({ limit: 100 })

  const active = useMemo(() => {
    return data?.data.find(
      (session) => session.isActive || session.status === "Active"
    )
  }, [data?.data])

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
