import { create } from "zustand"
import { SnakeUser as User } from "@/types/user"

export interface AdminsState {
  // Normalized data (by ID)
  admins: Record<string, User>
  adminIds: string[]

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
  setAdmins: (admins: User[]) => void
  addAdmin: (admin: User) => void
  updateAdmin: (id: string, updates: Partial<User>) => void
  removeAdmin: (id: string) => void
  setFilters: (filters: Partial<AdminsState["filters"]>) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetFilters: () => void

  getAdminById: (id: string) => User | undefined
}

const DEFAULT_FILTERS = {
  search: "",
  isActive: true,
  page: 1,
  limit: 10,
}

export const useAdminsStore = create<AdminsState>((set, get) => ({
  admins: {},
  adminIds: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setAdmins: (admins) => {
    set({
      admins: admins.reduce((acc, a) => ({ ...acc, [a.id]: a }), {}),
      adminIds: admins.map((a) => a.id),
    })
  },

  addAdmin: (admin) => {
    set((state) => ({
      admins: { ...state.admins, [admin.id]: admin },
      adminIds: state.adminIds.includes(admin.id)
        ? state.adminIds
        : [...state.adminIds, admin.id],
    }))
  },

  updateAdmin: (id, updates) =>
    set((state) => ({
      admins: {
        ...state.admins,
        [id]: { ...state.admins[id], ...updates },
      },
    })),

  removeAdmin: (id) =>
    set((state) => ({
      admins: Object.fromEntries(
        Object.entries(state.admins).filter(([key]) => key !== id)
      ),
      adminIds: state.adminIds.filter((aid) => aid !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  getAdminById: (id) => {
    return get().admins[id]
  },
}))

// Standalone Selectors/Helpers
export const selectFilteredAdmins = (
  admins: Record<string, User>,
  adminIds: string[],
  filters: AdminsState["filters"]
): User[] => {
  let filtered = adminIds.map((id) => admins[id]).filter(Boolean)

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (admin) =>
        admin.first_name?.toLowerCase().includes(searchLower) ||
        admin.last_name?.toLowerCase().includes(searchLower) ||
        admin.email?.toLowerCase().includes(searchLower) ||
        `${admin.first_name} ${admin.last_name}`
          .toLowerCase()
          .includes(searchLower)
    )
  }

  // Active status filter
  if (filters.isActive !== undefined) {
    filtered = filtered.filter((admin) => admin.is_active === filters.isActive)
  }

  return filtered
}

export const selectPaginatedAdmins = (
  admins: User[],
  page: number,
  limit: number
): User[] => {
  const start = (page - 1) * limit
  const end = start + limit
  return admins.slice(start, end)
}
