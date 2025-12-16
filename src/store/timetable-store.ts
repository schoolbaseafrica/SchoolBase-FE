import { create } from "zustand"
import { Schedule } from "@/lib/timetable"

export interface TimetableState {
  currentClassId: string | null
  schedules: Schedule[]

  isLoading: boolean
  error: string | null

  setTimetable: (classId: string, schedules: Schedule[]) => void
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (id: string, updates: Partial<Schedule>) => void
  removeSchedule: (id: string) => void

  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useTimetableStore = create<TimetableState>((set) => ({
  currentClassId: null,
  schedules: [],
  isLoading: false,
  error: null,

  setTimetable: (classId, schedules) => set({ currentClassId: classId, schedules }),

  addSchedule: (schedule) =>
    set((state) => ({ schedules: [...state.schedules, schedule] })),

  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
