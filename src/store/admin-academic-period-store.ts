import { create } from "zustand"
import { persist } from "zustand/middleware"

type AdminAcademicPeriodState = {
  sessionId: string | null
  termId: string | null
  setPeriod: (sessionId: string, termId: string | null) => void
  setTermId: (termId: string | null) => void
  reset: () => void
}

export const useAdminAcademicPeriodStore = create<AdminAcademicPeriodState>()(
  persist(
    (set) => ({
      sessionId: null,
      termId: null,
      setPeriod: (sessionId, termId) => set({ sessionId, termId }),
      setTermId: (termId) => set({ termId }),
      reset: () => set({ sessionId: null, termId: null }),
    }),
    { name: "schoolbase-admin-academic-period" }
  )
)
