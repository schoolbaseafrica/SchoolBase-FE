import { create } from "zustand"
import { AttendanceStudent, AttendanceSummary } from "@/lib/attendance"

export interface AttendanceState {
  currentClassId: string | null
  currentDate: string | null
  students: AttendanceStudent[]
  summary: AttendanceSummary | null

  isLoading: boolean
  error: string | null

  setAttendance: (
    classId: string,
    date: string,
    students: AttendanceStudent[],
    summary: AttendanceSummary
  ) => void
  updateStudentStatus: (studentId: string, status: AttendanceStudent["status"]) => void

  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  currentClassId: null,
  currentDate: null,
  students: [],
  summary: null,
  isLoading: false,
  error: null,

  setAttendance: (classId, date, students, summary) =>
    set({ currentClassId: classId, currentDate: date, students, summary }),

  updateStudentStatus: (studentId, status) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.student_id === studentId ? { ...s, status } : s
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
