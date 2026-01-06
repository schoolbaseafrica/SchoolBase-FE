"use client"

import { useAuthStore } from "@/store/auth-store"
import { usePathname } from "next/navigation"

/**
 * Hook to check if the current user is a super admin
 * Checks both the route path and the user's role
 */
export function useIsSuperAdmin() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  
  const isSuperAdminRoute = pathname?.startsWith("/super-admin")
  
  // Check if user has SUPERADMIN role
  // Role can be a string array like ["SUPERADMIN"] or ["ADMIN"], etc.
  const hasSuperAdminRole = user?.role?.some(
    (r) => typeof r === "string" && r.toUpperCase() === "SUPERADMIN"
  ) || false
  
  return isSuperAdminRoute || hasSuperAdminRole
}

