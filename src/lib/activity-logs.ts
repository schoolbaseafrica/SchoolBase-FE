import { apiFetch } from "./api/client"

export type ActivityAction = string

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

export interface ActivityLogFilterOptions {
  entity_types: string[]
  actions: string[]
}

const actionLabels: Record<string, string> = {
  ASSIGN_OWNER: "Assign owner",
  TRANSFER_OWNER: "Transfer owner",
  UPDATE_RETENTION: "Change retention",
  DEACTIVATE: "Deactivate",
  ACTIVATE: "Activate",
  PUBLISH: "Publish",
  MARK: "Mark attendance",
  RECORD: "Record payment",
}

const entityLabels: Record<string, string> = {
  school: "School",
  user: "User",
  CBT_EXAM: "CBT exam",
  CLASSROOM_ATTENDANCE: "Classroom attendance",
}

export const activityActionLabel = (action: string) =>
  actionLabels[action] ??
  action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase())

export const activityEntityLabel = (entity: string) =>
  entityLabels[entity] ??
  entity
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase())

export const ActivityLogsAPI = {
  getFilterOptions: () =>
    apiFetch<ActivityLogFilterOptions>("/activity-logs/filter-options", {}, true),
  getAll: (params?: GetActivityLogsParams) =>
    apiFetch<ActivityLogsListResponse>(
      "/activity-logs",
      {
        params,
      },
      true
    ),
}
