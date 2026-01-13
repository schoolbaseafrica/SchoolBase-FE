"use client"

import { useQuery } from "@tanstack/react-query"
import { ActivityLogsAPI, GetActivityLogsParams, ActivityLogsListResponse } from "@/lib/activity-logs"

const ACTIVITY_LOGS_KEY = ["activity-logs"]

export function useGetActivityLogs(params?: GetActivityLogsParams) {
  return useQuery<ActivityLogsListResponse>({
    queryKey: [...ACTIVITY_LOGS_KEY, params],
    queryFn: () => ActivityLogsAPI.getAll(params),
    staleTime: 1000 * 30, // 30 seconds - activity logs should be relatively fresh
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}
