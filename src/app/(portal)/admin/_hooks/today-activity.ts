"use client"

import { useQuery } from "@tanstack/react-query"
import { DashboardAPI } from "@/lib/dashboard"
import { useDashboardStore } from "@/store/dashboard-store"
import { useEffect } from "react"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

export const useTodayActivities = () => {
  const isSuperAdmin = useIsSuperAdmin()
  const setActivities = useDashboardStore((state) => state.setTodayActivities)
  const setLoading = useDashboardStore((state) => state.setLoading)
  // const setError = useDashboardStore((state) => state.setError)

  const query = useQuery({
    queryKey: ["today-activities"],
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await DashboardAPI.getTodayActivities()
        return res.data
      } finally {
        setLoading(false)
      }
    },
    enabled: !isSuperAdmin, // Disable for super admin
  })

  useEffect(() => {
    if (query.data) {
      setActivities(query.data)
    }
  }, [query.data, setActivities])

  return query
}
