import { apiFetch } from "./client"

// Types for student dashboard data
export interface RoomDto {
  id: string
  name: string
  capacity?: number
}

export interface TimetableItem {
  id: string
  subject_name: string
  subject_code?: string
  start_time: string
  end_time: string
  room?: RoomDto | null
  teacher_name?: string | null
  day_of_week?: string
  period_type?: string
}

export interface LatestResult {
  id: string
  subject_name: string
  subject_code?: string
  score: number
  grade?: string
  remark?: string
  term?: string
  academic_year?: string
  recorded_at?: Date | string
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  author_name?: string
}

export interface StudentDashboardMetadata {
  class: string
  enrollment_status: string
  total_subjects: number
}

export interface StudentDashboardData {
  todays_timetable: TimetableItem[]
  latest_results: LatestResult[]
  announcements: Announcement[]
  metadata: StudentDashboardMetadata
}

export interface StudentDashboardResponse {
  message: string
  status_code: number
  data: StudentDashboardData
}

// Student Dashboard API
export const StudentAPI = {
  /**
   * Get student dashboard data
   */
  getDashboard: (): Promise<StudentDashboardResponse> => {
    return apiFetch<StudentDashboardResponse>(
      "/dashboard/student/load",
      {
        method: "GET",
      },
      true // use proxy
    )
  },
}
