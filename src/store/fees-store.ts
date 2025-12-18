import { create } from "zustand"
import { FeeComponent } from "@/lib/fees-management"

export interface FeesState {
  fees: Record<string, FeeComponent>
  feeIds: string[]
  isLoading: boolean
  error: string | null

  // Filters
  filters: {
    page: number
    limit: number
    search?: string
    status?: string
  }

  setFees: (fees: FeeComponent[]) => void
  addFee: (fee: FeeComponent) => void
  updateFee: (id: string, updates: Partial<FeeComponent>) => void
  removeFee: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<FeesState["filters"]>) => void

  getFeeById: (id: string) => FeeComponent | undefined
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
}

export const useFeesStore = create<FeesState>((set, get) => ({
  fees: {},
  feeIds: [],
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setFees: (fees) =>
    set({
      fees: fees.reduce((acc, f) => ({ ...acc, [f.id]: f }), {}),
      feeIds: fees.map((f) => f.id),
    }),

  addFee: (fee) =>
    set((state) => ({
      fees: { ...state.fees, [fee.id]: fee },
      feeIds: [...state.feeIds, fee.id],
    })),

  updateFee: (id, updates) =>
    set((state) => ({
      fees: { ...state.fees, [id]: { ...state.fees[id], ...updates } },
    })),

  removeFee: (id) =>
    set((state) => ({
      fees: Object.fromEntries(Object.entries(state.fees).filter(([k]) => k !== id)),
      feeIds: state.feeIds.filter((fid) => fid !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  getFeeById: (id) => get().fees[id],
}))

export const selectFilteredFees = (
  fees: Record<string, FeeComponent>,
  feeIds: string[],
  filters: FeesState["filters"]
) => {
  let filtered = feeIds.map((id) => fees[id]).filter(Boolean)

  if (filters.status) {
    filtered = filtered.filter((f) => f.status === filters.status)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (f) =>
        f.component_name.toLowerCase().includes(search) ||
        f.description?.toLowerCase().includes(search)
    )
  }

  return filtered
}

export const selectPaginatedFees = (
  filtered: FeeComponent[],
  page: number,
  limit: number
) => {
  const start = (page - 1) * limit
  return filtered.slice(start, start + limit)
}
