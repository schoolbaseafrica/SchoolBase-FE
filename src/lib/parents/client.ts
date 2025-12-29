import { apiFetch } from "../api/client"

export interface StudentEvent {
  title: string
  date: string
}

export interface StudentAcademic {
  term: string
  grade: string
}

export interface StudentAttendance {
  present: number
  absent: number
}

export interface StudentFees {
  amount: number
  dueDate: string
  status: "Paid" | "Unpaid"
}

export interface Student {
  id: string
  registration_number?: string
  first_name: string
  last_name: string
  full_name: string
  photo_url: string
}

export interface DummyStudentExtras extends Student {
  class: string
  academic: StudentAcademic
  attendance: StudentAttendance
  fees: StudentFees
  events: StudentEvent[]
}

type ResponsePack<T> = {
  data: T
  message: string
  status_code: number
}

export interface StudentProfileResponse {
  id: string
  registration_number?: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  photo_url?: string
  class_details: {
    id: string
    name: string
  } | null
  academic_details: {
    id: string
    session: string
  } | null
}

export interface MonthlyAttendanceResponse {
  message?: string
  month: string
  year: number
  registration_number: string
  student_id: string
  total_days_in_month: number
  days_present: number
  days_absent: number
  days_late: number
  days_excused: number
  days_half_day: number
  attendance_details?: Array<{
    date: string
    status: string
    check_in_time?: string
    check_out_time?: string
    notes?: string
  }>
}

export const ParentStudents = {
  getAll: () => {
    return apiFetch<ResponsePack<Student[]>>(
      "/parents/my-students",
      { method: "GET" },
      true
    )
  },

  getOne: (studentID: string) =>
    apiFetch(`/students/${studentID}`, { method: "GET" }, true),

  getStudentProfile: async (parentId: string, studentId: string) => {
    const response = await apiFetch<ResponsePack<StudentProfileResponse>>(
      `/parents/${parentId}/link-students/${studentId}`,
      { method: "GET" },
      true
    )
    return response.data
  },

  getMonthlyAttendance: async (registrationNumber: string) => {
    const response = await apiFetch<
      MonthlyAttendanceResponse | { message: string; data: MonthlyAttendanceResponse }
    >(
      `/attendance/daily/student/parent?registration_number=${registrationNumber}`,
      { method: "GET" },
      true
    )
    // Handle wrapped response (backend returns { message, data: {...} })
    if (response && typeof response === "object") {
      // Check if it's the direct response structure (has attendance_details which is unique to the actual data)
      if ("attendance_details" in response) {
        return response as MonthlyAttendanceResponse
      }
      // Check if it has 'month' and 'days_present' (indicating it's the direct response, not wrapped)
      if ("month" in response && "days_present" in response && !("data" in response)) {
        return response as MonthlyAttendanceResponse
      }
      // Otherwise, it's wrapped (has data property containing the actual response)
      if ("data" in response && response.data) {
        return response.data as MonthlyAttendanceResponse
      }
    }
    return response as MonthlyAttendanceResponse
  },

  getDummyExtras: () => {
    return new Promise<DummyStudentExtras>((res) => {
      setTimeout(() => {
        res(studentsData)
      }, 500)
    })
  },
}

export const studentsData: DummyStudentExtras = {
  id: "1",
  first_name: "Sarah",
  last_name: "F.",
  full_name: "Sarah F.",
  class: "Jss3C",
  photo_url: "/assets/images/parent.png",
  academic: { term: "2nd", grade: "A" },
  attendance: { present: 85, absent: 3 },
  fees: { amount: 300000, dueDate: "1 March 2025", status: "Unpaid" },
  events: [
    { title: "Mid-Term Break", date: "27-28 December 2025" },
    { title: "Christmas Carol", date: "29 December 2025" },
  ],
}
