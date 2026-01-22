"use client"

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
    staleTime: 20 * 60 * 1000, // 20 minutes
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
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ACADEMIC_SESSIONS_KEY, exact: false })
      
      // Snapshot the previous value
      const previousSessions = queryClient.getQueriesData({ queryKey: ACADEMIC_SESSIONS_KEY, exact: false })
      
      return { previousSessions }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        context.previousSessions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: async (data, id) => {
      console.log("Mutation onSuccess - data:", data) // Debug log
      console.log("Mutation onSuccess - status:", data?.status) // Debug log
      
      // Get all matching queries to see their structure
      const allQueries = queryClient.getQueriesData({ queryKey: ACADEMIC_SESSIONS_KEY, exact: false })
      console.log("All session queries:", allQueries) // Debug log
      
      // Update each query individually to handle different structures
      allQueries.forEach(([queryKey, queryData]: [any, any]) => {
        if (!queryData) return
        
        console.log("Updating query:", queryKey, "with data:", queryData) // Debug log
        
        // Handle PaginatedSessions structure: { data: [...], meta: {...} }
        if (queryData.data && Array.isArray(queryData.data)) {
          queryClient.setQueryData(queryKey, {
            ...queryData,
            data: queryData.data.map((s: AcademicSession) => {
              // Activate the target session
              if (s.id === id) {
                console.log("Activating session:", s.id) // Debug log
                return { ...s, status: "Active" as const, isActive: true }
              }
              // Deactivate any other active sessions
              if (s.status === "Active") {
                console.log("Deactivating session:", s.id) // Debug log
                return { ...s, status: "Inactive" as const, isActive: false }
              }
              return s
            }),
          })
        }
        // Handle direct array (shouldn't happen but just in case)
        else if (Array.isArray(queryData)) {
          queryClient.setQueryData(queryKey, queryData.map((s: AcademicSession) => {
            if (s.id === id) {
              return { ...s, status: "Active" as const, isActive: true }
            }
            if (s.status === "Active") {
              return { ...s, status: "Inactive" as const, isActive: false }
            }
            return s
          }))
        }
      })
      
      // Invalidate and refetch to get fresh data from server (but don't await immediately)
      queryClient.invalidateQueries({ 
        queryKey: ACADEMIC_SESSIONS_KEY,
        exact: false,
      })
      queryClient.invalidateQueries({ 
        queryKey: ["academic-session", id],
      })
      queryClient.invalidateQueries({ 
        queryKey: ACTIVE_SESSION_KEY,
      })
      
      // Refetch after a short delay to allow UI to render the optimistic update first
      setTimeout(async () => {
        await Promise.all([
          queryClient.refetchQueries({ 
            queryKey: ACADEMIC_SESSIONS_KEY,
            exact: false,
          }),
          queryClient.refetchQueries({ 
            queryKey: ACTIVE_SESSION_KEY,
          })
        ])
        console.log("Queries refetched after delay") // Debug log
      }, 100)
      
      console.log("Queries invalidated") // Debug log
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
