// File: src/hooks/use-auth-user.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { getCurrentAuthUser } from "@/lib/results/auth-utils"

const AUTH_USER_KEY = ["auth-user"]

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_USER_KEY,
    queryFn: getCurrentAuthUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useStudentAuth() {
  const { data: user, isLoading, error } = useAuthUser()

  const isStudent = user ? user.role.includes("STUDENT") : false
  const studentId = user?.student_id
  const studentName = user ? `${user.first_name} ${user.last_name}` : ""

  return {
    user,
    isLoading,
    error,
    isStudent,
    studentId,
    studentName,
    hasStudentId: !!studentId,
  }
}

export function useParentAuth() {
  const { data: user, isLoading, error } = useAuthUser()

  const isParent = user ? user.role.includes("PARENT") : false
  const parentId = user?.parent_id

  return {
    user,
    isLoading,
    error,
    isParent,
    parentId,
    hasParentId: !!parentId,
  }
}
