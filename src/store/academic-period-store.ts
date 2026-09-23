import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AcademicPeriodSelection = {
  sessionId: string | null
  termId: string | null
}

type AcademicPeriodState = {
  selections: Record<string, AcademicPeriodSelection>
  setPeriod: (scope: string, sessionId: string, termId: string | null) => void
  setTermId: (scope: string, termId: string | null) => void
  reset: (scope: string) => void
}

export const useAcademicPeriodStore = create<AcademicPeriodState>()(
  persist(
    (set) => ({
      selections: {},
      setPeriod: (scope, sessionId, termId) =>
        set((state) => ({
          selections: { ...state.selections, [scope]: { sessionId, termId } },
        })),
      setTermId: (scope, termId) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [scope]: {
              sessionId: state.selections[scope]?.sessionId ?? null,
              termId,
            },
          },
        })),
      reset: (scope) =>
        set((state) => {
          const selections = { ...state.selections }
          delete selections[scope]
          return { selections }
        }),
    }),
    { name: "schoolbase-academic-period" }
  )
)
