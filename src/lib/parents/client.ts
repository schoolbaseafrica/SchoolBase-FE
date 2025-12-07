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

export const ParentStudents = {
  getAll: () => {
    // return new Promise<Student[]>((res) => {
    //   setTimeout(() => {
    //     res(studentsData)
    //   }, 500)
    // })
    return apiFetch<Student[]>("/parents/my-students", { method: "GET" }, true)
  },

  getOne: (studentID: string) =>
    apiFetch(`/students/${studentID}`, { method: "GET" }, true),

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
