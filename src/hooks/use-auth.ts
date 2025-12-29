"use client"

import { useGetUser } from "./use-user-data"

export function useAuth() {
  const { data: userData, isLoading, error } = useGetUser()

  return {
    user: userData
      ? {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          role: userData.role,
        }
      : null,
    isLoading,
    error,
    isAuthenticated: !!userData,
  }
}
