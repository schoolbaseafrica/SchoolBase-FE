import { create } from "zustand"
import { SnakeUser as User } from "@/types/user"

export interface TeachersState {
  // Normalized data (by ID)
  teachers: Record<string, User>
  teacherIds: string[]

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
  setTeachers: (teachers: User[]) => void
  addTeacher: (teacher: User) => void
  updateTeacher: (id: string, updates: Partial<User>) => void
  removeTeacher: (id: string) => void
  setFilters: (filters: Partial<TeachersState["filters"]>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetFilters: () => void

  getTeacherById: (id: string) => User | undefined
}

const DEFAULT_FILTERS = {
  search: "",
  isActive: true, // defaulting to true as per previous code
  page: 1,
  limit: 10,
}

export const useTeachersStore = create<TeachersState>((set, get) => ({
  teachers: {},
  teacherIds: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setTeachers: (teachers) => {
    set({
      teachers: teachers.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}),
      teacherIds: teachers.map((t) => t.id),
    })
  },

  addTeacher: (teacher) => {
    set((state) => ({
      teachers: { ...state.teachers, [teacher.id]: teacher },
      teacherIds: state.teacherIds.includes(teacher.id)
        ? state.teacherIds
        : [...state.teacherIds, teacher.id],
    }))
  },

  updateTeacher: (id, updates) =>
    set((state) => ({
      teachers: {
        ...state.teachers,
        [id]: { ...state.teachers[id], ...updates },
      },
    })),

  removeTeacher: (id) =>
    set((state) => ({
      teachers: Object.fromEntries(
        Object.entries(state.teachers).filter(([key]) => key !== id)
      ),
      teacherIds: state.teacherIds.filter((tid) => tid !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  getTeacherById: (id) => {
    return get().teachers[id]
  },
}))

// Standalone Selectors/Helpers
// These are not hooks, just pure functions to filter data
export const selectFilteredTeachers = (
  teachers: Record<string, User>,
  teacherIds: string[],
  filters: TeachersState["filters"]
) => {
  let filtered = teacherIds.map((id) => teachers[id]).filter(Boolean)

  // Filter by active status
  if (filters.isActive !== undefined) {
    filtered = filtered.filter((t) => t.is_active === filters.isActive)
  }

  // Filter by search
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.first_name?.toLowerCase().includes(search) ||
        t.last_name?.toLowerCase().includes(search) ||
        t.email?.toLowerCase().includes(search)
    )
  }

  return filtered
}

export const selectPaginatedTeachers = (
  filtered: User[],
  page: number,
  limit: number
) => {
  const start = (page - 1) * limit
  const end = start + limit
  return filtered.slice(start, end)
}
