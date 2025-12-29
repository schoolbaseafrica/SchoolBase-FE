import { create } from "zustand"
import { GradeSubmission } from "@/types/result"

export interface ResultsState {
  submissions: Record<string, GradeSubmission>
  submissionIds: string[]
  currentSubmission: GradeSubmission | null

  isLoading: boolean
  error: string | null

  filters: {
    status?: string
    classId?: string
    subjectId?: string
    termId?: string
  }

  setSubmissions: (submissions: GradeSubmission[]) => void
  setCurrentSubmission: (submission: GradeSubmission | null) => void
  updateSubmission: (id: string, updates: Partial<GradeSubmission>) => void

  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ResultsState["filters"]>) => void

  getSubmissionById: (id: string) => GradeSubmission | undefined
}

export const useResultsStore = create<ResultsState>((set, get) => ({
  submissions: {},
  submissionIds: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  filters: {},

  setSubmissions: (submissions) =>
    set({
      submissions: submissions.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
      submissionIds: submissions.map((s) => s.id),
    }),

  setCurrentSubmission: (submission) => set({ currentSubmission: submission }),

  updateSubmission: (id, updates) =>
    set((state) => ({
      submissions: {
        ...state.submissions,
        [id]: { ...state.submissions[id], ...updates },
      },
      currentSubmission:
        state.currentSubmission?.id === id
          ? { ...state.currentSubmission, ...updates }
          : state.currentSubmission,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  getSubmissionById: (id) => get().submissions[id],
}))

export const selectFilteredSubmissions = (
  submissions: Record<string, GradeSubmission>,
  submissionIds: string[],
  filters: ResultsState["filters"]
) => {
  let filtered = submissionIds.map((id) => submissions[id]).filter(Boolean)

  if (filters.status) {
    filtered = filtered.filter((s) => s.status === filters.status)
  }

  if (filters.classId) {
    filtered = filtered.filter((s) => s.class_id === filters.classId)
  }

  // Note: Standard filtering logic

  return filtered
}
