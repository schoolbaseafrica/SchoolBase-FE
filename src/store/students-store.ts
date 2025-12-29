import { create } from "zustand"
import { SnakeUser as User } from "@/types/user"

export interface StudentsState {
  // Normalized data
  students: Record<string, User>
  studentIds: string[]

  // UI state
  isLoading: boolean
  error: string | null

  // Filters (client-side)
  filters: {
    search: string
    isActive: boolean | undefined
    page: number
    limit: number
  }

  // Actions
  setStudents: (students: User[]) => void
  addStudent: (student: User) => void
  updateStudent: (id: string, updates: Partial<User>) => void
  removeStudent: (id: string) => void
  setFilters: (filters: Partial<StudentsState["filters"]>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetFilters: () => void

  getStudentById: (id: string) => User | undefined
}

const DEFAULT_FILTERS = {
  search: "",
  isActive: true,
  page: 1,
  limit: 10,
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  students: {},
  studentIds: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setStudents: (students) =>
    set({
      students: students.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
      studentIds: students.map((s) => s.id),
    }),

  addStudent: (student) =>
    set((state) => ({
      students: { ...state.students, [student.id]: student },
      studentIds: [...state.studentIds, student.id],
    })),

  updateStudent: (id, updates) =>
    set((state) => ({
      students: {
        ...state.students,
        [id]: { ...state.students[id], ...updates },
      },
    })),

  removeStudent: (id) =>
    set((state) => ({
      students: Object.fromEntries(
        Object.entries(state.students).filter(([key]) => key !== id)
      ),
      studentIds: state.studentIds.filter((sid) => sid !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  getStudentById: (id) => {
    return get().students[id]
  },
}))

export const selectFilteredStudents = (
  students: Record<string, User>,
  studentIds: string[],
  filters: StudentsState["filters"]
) => {
  let filtered = studentIds.map((id) => students[id]).filter(Boolean)

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((s) => s.is_active === filters.isActive)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.first_name?.toLowerCase().includes(search) ||
        s.last_name?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.reg_number?.toLowerCase().includes(search)
    )
  }

  return filtered
}

export const selectPaginatedStudents = (
  filtered: User[],
  page: number,
  limit: number
) => {
  const start = (page - 1) * limit
  const end = start + limit
  return filtered.slice(start, end)
}
