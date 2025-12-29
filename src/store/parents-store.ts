import { create } from "zustand"
import { SnakeUser as User } from "@/types/user"

export interface ParentsState {
  // Normalized data
  parents: Record<string, User>
  parentIds: string[]

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
  setParents: (parents: User[]) => void
  addParent: (parent: User) => void
  updateParent: (id: string, updates: Partial<User>) => void
  removeParent: (id: string) => void
  setFilters: (filters: Partial<ParentsState["filters"]>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetFilters: () => void

  getParentById: (id: string) => User | undefined
}

const DEFAULT_FILTERS = {
  search: "",
  isActive: true,
  page: 1,
  limit: 10,
}

export const useParentsStore = create<ParentsState>((set, get) => ({
  parents: {},
  parentIds: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setParents: (parents) =>
    set({
      parents: parents.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      parentIds: parents.map((p) => p.id),
    }),

  addParent: (parent) => {
    console.log("addParent called with:", parent)
    console.log("Parent ID:", parent?.id)
    set((state) => {
      const newState = {
        parents: { ...state.parents, [parent.id]: parent },
        parentIds: state.parentIds.includes(parent.id)
          ? state.parentIds
          : [...state.parentIds, parent.id],
      }
      console.log("Updated store state:", {
        parentCount: Object.keys(newState.parents).length,
        parentIds: newState.parentIds.length,
        newParentId: parent.id,
      })
      return newState
    })
  },

  updateParent: (id, updates) =>
    set((state) => ({
      parents: {
        ...state.parents,
        [id]: { ...state.parents[id], ...updates },
      },
    })),

  removeParent: (id) =>
    set((state) => ({
      parents: Object.fromEntries(
        Object.entries(state.parents).filter(([key]) => key !== id)
      ),
      parentIds: state.parentIds.filter((pid) => pid !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  getParentById: (id) => {
    return get().parents[id]
  },
}))

export const selectFilteredParents = (
  parents: Record<string, User>,
  parentIds: string[],
  filters: ParentsState["filters"]
) => {
  let filtered = parentIds.map((id) => parents[id]).filter(Boolean)

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((p) => p.is_active === filters.isActive)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.first_name?.toLowerCase().includes(search) ||
        p.last_name?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search)
    )
  }

  return filtered
}

export const selectPaginatedParents = (filtered: User[], page: number, limit: number) => {
  const start = (page - 1) * limit
  const end = start + limit
  return filtered.slice(start, end)
}
