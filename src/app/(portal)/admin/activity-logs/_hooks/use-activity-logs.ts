"use client"

import { useQuery } from "@tanstack/react-query"
import { ActivityLogsAPI, GetActivityLogsParams, ActivityLogsListResponse } from "@/lib/activity-logs"

const ACTIVITY_LOGS_KEY = ["activity-logs"]

export function useGetActivityLogs(params?: GetActivityLogsParams) {
  // Create a stable query key by explicitly listing all params
  // This ensures React Query properly detects when params change
  const queryKey = [
    ...ACTIVITY_LOGS_KEY,
    "list",
    params?.page ?? 1,
    params?.limit ?? 20,
    params?.user_id ?? null,
    params?.entity_type ?? null,
    params?.entity_id ?? null,
    params?.action ?? null,
    params?.start_date ?? null,
    params?.end_date ?? null,
  ]

  return useQuery<ActivityLogsListResponse>({
    queryKey,
    queryFn: () => ActivityLogsAPI.getAll(params),
    staleTime: 0, // Always refetch to ensure fresh data when page changes
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}
