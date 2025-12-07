"use client"

import { useQuery } from "@tanstack/react-query"
import { DashboardAPI } from "@/lib/dashboard"

export const useTodayActivities = () => {
  return useQuery({
    queryKey: ["today-activities"],
    queryFn: () => DashboardAPI.getTodayActivities(),
    select: (res) => res.data, // return only the actual data (not status, message)
  })
}
