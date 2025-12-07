"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserData, sendLogoutRequest } from "@/lib/api/auth"

// The main list query key
const USER_DATA_KEY = ["user"]

// ----------------------------
// 🔍 GET CURRENT USER
// ----------------------------
export function useGetUser() {
  return useQuery({
    queryKey: USER_DATA_KEY,
    queryFn: () => getUserData(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendLogoutRequest,
    onSuccess: () => {
      // Remove all user-related data instantly
      queryClient.removeQueries({ queryKey: USER_DATA_KEY })

      // Optionally clear ALL app data
      queryClient.clear()

      // You might want to redirect to login page here
      if (typeof window !== "undefined") window.location.href = "/login"
    },
  })
}
