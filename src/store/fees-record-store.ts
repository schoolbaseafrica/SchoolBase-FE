import { create } from "zustand"
import { FeePayment, FeesAnalyticsResponse } from "@/lib/fees"

export interface FeesRecordState {
  payments: FeePayment[]
  analytics: FeesAnalyticsResponse["data"] | null
  isLoading: boolean
  error: string | null

  // Filters state if needed
  filters: {
    page: number
    limit: number
    search?: string
    status?: string
    student_id?: string
  }

  // Actions
  setPayments: (payments: FeePayment[]) => void
  setAnalytics: (analytics: FeesAnalyticsResponse["data"]) => void
  addPayment: (payment: FeePayment) => void
  updatePayment: (id: string, updates: Partial<FeePayment>) => void // assuming updates possible
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<FeesRecordState["filters"]>) => void
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
}

export const useFeesRecordStore = create<FeesRecordState>((set) => ({
  payments: [],
  analytics: null,
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  setPayments: (payments) => set({ payments }),
  setAnalytics: (analytics) => set({ analytics }),

  addPayment: (payment) => set((state) => ({ payments: [payment, ...state.payments] })),

  updatePayment: (id, updates) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
}))
