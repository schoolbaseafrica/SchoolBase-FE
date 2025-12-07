import { apiFetch } from "./api/client"

export interface Schedule {
  id: string
  day: string
  start_time: string
  end_time: string
  period_type: string
  room: {
    id: string
    name: string
    capacity: number
  } | null
  subject: {
    id: string
    name: string
  } | null
  teacher: {
    id: string
    title: string
    first_name: string
    last_name: string
  } | null
}

export interface TimetableResponse {
  class_id: string
  schedules: Schedule[]
}

export interface CreateSchedulePayload {
  day: string
  start_time: string
  end_time: string
  period_type: "ACADEMICS" | "BREAK"
  subject_id?: string
  teacher_id?: string
  room_id?: string
  class_id: string
}

type ResponsePack<T> = {
  status_code: number
  message: string | null
  data: T
}

export const TimetableAPI = {
  getClassTimetable: (classId: string) =>
    apiFetch<ResponsePack<TimetableResponse>>(
      `/timetables/class/${classId}`,
      { method: "GET" },
      true
    ),

  createSchedule: (data: CreateSchedulePayload) =>
    apiFetch<ResponsePack<null>>(
      "/timetables/schedule",
      {
        method: "POST",
        data,
      },
      true
    ),

  updateSchedule: (id: string, data: Partial<CreateSchedulePayload>) =>
    apiFetch<ResponsePack<null>>(
      `/timetables/schedule/${id}`,
      {
        method: "PUT",
        data,
      },
      true
    ),

  deleteSchedule: (id: string) =>
    apiFetch<ResponsePack<null>>(
      `/timetables/schedule/${id}`,
      { method: "DELETE" },
      true
    ),
}
