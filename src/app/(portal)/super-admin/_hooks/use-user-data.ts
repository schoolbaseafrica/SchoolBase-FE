"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserData } from "@/lib/api/auth"

// The main list query key
const USER_DATA_KEY = ["user"]

// ----------------------------
// 🔍 GET CURRENT USER
// ----------------------------
export function useGetSuperAdmin() {
  return useQuery({
    queryKey: USER_DATA_KEY,
    queryFn: () => getUserData(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60,
  })
}
