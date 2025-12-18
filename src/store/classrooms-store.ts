import { create } from "zustand"
import { Classroom } from "@/lib/classrooms"

export interface ClassroomsState {
  classrooms: Classroom[]
  isLoading: boolean
  error: string | null

  filters: {
    page: number
    limit: number
    search?: string
    type?: string
    location?: string
    is_available?: boolean
  }

  // Actions
  setClassrooms: (classrooms: Classroom[]) => void
  addClassroom: (classroom: Classroom) => void
  updateClassroom: (id: string, updates: Partial<Classroom>) => void
  removeClassroom: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ClassroomsState["filters"]>) => void

  getClassroomById: (id: string) => Classroom | undefined
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
}

export const useClassroomsStore = create<ClassroomsState>((set, get) => ({
  classrooms: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setClassrooms: (classrooms) => set({ classrooms }),

  addClassroom: (classroom) =>
    set((state) => ({ classrooms: [classroom, ...state.classrooms] })),

  updateClassroom: (id, updates) =>
    set((state) => ({
      classrooms: state.classrooms.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  removeClassroom: (id) =>
    set((state) => ({
      classrooms: state.classrooms.filter((c) => c.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  getClassroomById: (id) => get().classrooms.find((c) => c.id === id),
}))
