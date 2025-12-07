"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserData, sendLogoutRequest } from "@/lib/api/auth"

const USER_DATA_KEY = ["user"]

export function useGetUser() {
  return useQuery({
    queryKey: USER_DATA_KEY,
    queryFn: () => getUserData(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
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
