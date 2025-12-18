import { create } from "zustand"
import { ClassItem, SingleClass } from "@/lib/classes"

export interface ClassesState {
  // We store the grouped items as returned by getAll
  classItems: ClassItem[]

  // We might also want to store flat classes for easier lookup if needed
  // But given the UI probably groups them, we keep the structure.

  isLoading: boolean
  error: string | null
  selectedClass: SingleClass | null

  // Filters
  filters: {
    page: number
    limit: number
  }

  // Actions
  setClassItems: (items: ClassItem[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ClassesState["filters"]>) => void
  setSelectedClass: (selected: SingleClass | null) => void
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
}

export const useClassesStore = create<ClassesState>((set) => ({
  classItems: [],
  isLoading: false,
  error: null,
  selectedClass: null,
  filters: DEFAULT_FILTERS,

  setClassItems: (items) => set({ classItems: items }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setSelectedClass: (selected) => set({ selectedClass: selected }),
}))

// Selectors
export const selectClassItems = (state: ClassesState) => state.classItems
export const selectSelectedClass = (state: ClassesState) => state.selectedClass
