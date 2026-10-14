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

// Timetable times are currently stored in Africa/Lagos local time. A classroom
// prepared ahead of a lesson belongs to the next occurrence of that slot.
export function nextClassroomLessonWindow(schedule: Schedule, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ""
  const weekdays = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]
  const today = weekdays.indexOf(part("weekday").toUpperCase())
  const lessonDay = weekdays.indexOf(schedule.day.toUpperCase())
  if (today < 0 || lessonDay < 0) throw new Error("Invalid timetable day")
  const localDate = Date.UTC(
    Number(part("year")),
    Number(part("month")) - 1,
    Number(part("day"))
  )
  let dayOffset = (lessonDay - today + 7) % 7
  const inLagos = (time: string, offset: number) => {
    const [hour, minute] = time.split(":").map(Number)
    // Nigeria observes UTC+1 throughout the year.
    return new Date(
      localDate + offset * 86_400_000 + (hour - 1) * 3_600_000 + minute * 60_000
    )
  }
  if (inLagos(schedule.end_time, dayOffset) <= now) dayOffset += 7
  return {
    startsAt: inLagos(schedule.start_time, dayOffset),
    endsAt: inLagos(schedule.end_time, dayOffset),
  }
}

export interface TimetableResponse {
  class_id: string
  schedules: Schedule[]
}

export interface ScheduleOption {
  subject: { id: string; name: string }
  teacher: { id: string; name: string }
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
  getClassScheduleOptions: (classId: string) =>
    apiFetch<ResponsePack<ScheduleOption[]>>(
      `/timetables/class/${classId}/options`,
      { method: "GET" },
      true
    ),
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
