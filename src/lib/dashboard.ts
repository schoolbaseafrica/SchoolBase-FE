import { apiFetch } from "./api/client"

// --------------------
// Types
// --------------------

export interface Teacher {
  id: string
  title: string
  first_name: string
  last_name: string
  full_name: string
}

export interface Subject {
  id: string
  name: string
}

export interface ClassInfo {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  capacity: number
}

export interface Activity {
  schedule_id: string
  teacher: Teacher | null
  subject: Subject
  class: ClassInfo
  start_time: string
  end_time: string
  venue: Room | null | string
  period_type: string
  progress_status: string
}

export interface ActivitySummary {
  total_activities: number
  completed_activities: number
  in_progress_activities: number
  upcoming_activities: number
  activities_with_no_teacher: number
}

export interface TodayActivitiesData {
  todays_activities: Activity[]
  summary: ActivitySummary
}

export interface AdminDashboardMetadata {
  total_students: number
  total_teachers: number
  total_parents: number
}

export interface ResolvedDashboardData {
  dashboard: string
  modules: unknown[]
  metadata: AdminDashboardMetadata
}

interface ResponsePack<T> {
  status_code: number
  message: string
  data: T
}

// --------------------
// API Wrapper
// --------------------

export const DashboardAPI = {
  resolve: (params?: { session_id?: string }) =>
    apiFetch<ResponsePack<ResolvedDashboardData>>(
      "/dashboard/resolve",
      { method: "GET", params },
      true
    ),
  getTodayActivities: (params?: { session_id?: string }) =>
    apiFetch<ResponsePack<TodayActivitiesData>>(
      "/dashboard/admin/today-activities",
      { method: "GET", params },
      true
    ),
}
