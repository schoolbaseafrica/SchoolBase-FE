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

export interface Activity {
  schedule_id: string
  teacher: Teacher | null
  subject: Subject
  class: ClassInfo
  start_time: string
  end_time: string
  venue: string
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

interface ResponsePack<T> {
  status_code: number
  message: string
  data: T
}

// --------------------
// API Wrapper
// --------------------

export const DashboardAPI = {
  getTodayActivities: () =>
    apiFetch<ResponsePack<TodayActivitiesData>>(
      "/dashboard/admin/today-activities",
      { method: "GET" },
      true
    ),
}
