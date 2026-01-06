"use client"

import { useGetUser, useGetSuperAdmin } from "@/hooks/use-user-data"
import { useAuthStore } from "@/store/auth-store"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isSuperAdminRoute = pathname?.startsWith("/super-admin")
  
  // Use super admin hook for super admin routes, regular user hook for others
  const { data: userData } = useGetUser({ enabled: !isSuperAdminRoute })
  const { data: superAdminData } = useGetSuperAdmin({ enabled: isSuperAdminRoute })
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (isSuperAdminRoute && superAdminData) {
      // Map super admin data to user format for auth store
      setUser({
        id: superAdminData.id,
        email: superAdminData.email,
        first_name: superAdminData.first_name,
        last_name: superAdminData.last_name,
        role: [superAdminData.role], // Convert to array format
        middle_name: "",
        gender: null,
        dob: "",
        phone: "",
        is_active: superAdminData.is_active,
        created_at: superAdminData.created_at,
        updated_at: superAdminData.updated_at,
      })
    } else if (!isSuperAdminRoute && userData && userData.email) {
      setUser(userData)
    }
  }, [userData, superAdminData, isSuperAdminRoute, setUser])

  return children
}
