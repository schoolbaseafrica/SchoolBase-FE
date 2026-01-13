import { apiFetch } from "./api/client"

type ResponsePack<T> = {
  data: T
  message: string
}

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE"

export interface ActivityLog {
  id: string
  user_id: string
  user_name: string
  user_email: string
  entity_type: string
  entity_id: string
  action: ActivityAction
  description?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
}

export interface GetActivityLogsParams {
  page?: number
  limit?: number
  user_id?: string
  entity_type?: string
  entity_id?: string
  action?: ActivityAction
  start_date?: string
  end_date?: string
}

export interface ActivityLogsListResponse {
  data: ActivityLog[]
  message: string
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export const ActivityLogsAPI = {
  getAll: (params?: GetActivityLogsParams) =>
    apiFetch<ActivityLogsListResponse>(
      "/activity-logs",
      {
        params,
      },
      true
    ),
}
