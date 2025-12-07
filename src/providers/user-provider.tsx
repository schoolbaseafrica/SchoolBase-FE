"use client"

import { useGetUser } from "@/hooks/use-user-data"
import { useAuthStore } from "@/store/auth-store"
import { useEffect } from "react"

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: userData } = useGetUser()
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (userData && userData.email) {
      setUser(userData)
    }
  }, [userData, setUser])

  return children
}
