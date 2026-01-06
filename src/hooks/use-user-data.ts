"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserData, sendLogoutRequest } from "@/lib/api/auth"
import { SuperAdminAPI } from "@/lib/api/superadmin"

const USER_DATA_KEY = ["user"]
const SUPERADMIN_DATA_KEY = ["superadmin"]

export function useGetUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: USER_DATA_KEY,
    queryFn: () => getUserData(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false, // Default to true if not specified
  })
}

export function useGetSuperAdmin(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SUPERADMIN_DATA_KEY,
    queryFn: () => SuperAdminAPI.getMe(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false, // Default to true if not specified
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendLogoutRequest,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USER_DATA_KEY })

      if (typeof window !== "undefined") window.location.href = "/login"
    },
  })
}
