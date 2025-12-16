import { create } from "zustand"
import { TodayActivitiesData } from "@/lib/dashboard"

export interface DashboardState {
  todayActivities: TodayActivitiesData | null
  isLoading: boolean
  error: string | null

  setTodayActivities: (data: TodayActivitiesData) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  todayActivities: null,
  isLoading: false,
  error: null,

  setTodayActivities: (data) => set({ todayActivities: data }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
