import { apiFetch } from "./client"

// Types for teacher dashboard data
export interface RoomDto {
  id: string
  name: string
  capacity?: number
}

export interface TodaysClassDto {
  schedule_id: string
  class_name: string
  class_id: string
  subject_name: string
  subject_id: string
  start_time: string
  end_time: string
  room: RoomDto | null
}

export interface TodaysClassesResponseDto {
  todays_classes: TodaysClassDto[]
  total_classes: number
}

export interface TodaysClassesResponse {
  message: string
  status_code: number
  data: TodaysClassesResponseDto
}

// Teacher Dashboard API
export const TeacherDashboardAPI = {
  /**
   * Get today's classes for the authenticated teacher
   */
  getTodaysClasses: (): Promise<TodaysClassesResponse> => {
    return apiFetch<TodaysClassesResponse>(
      "/dashboard/teacher/today-classes",
      {
        method: "GET",
      },
      true // use proxy
    )
  },
}
