import { create } from "zustand"
import { Subject } from "@/lib/subjects"

export interface SubjectsState {
  subjects: Record<string, Subject>
  subjectIds: string[]
  isLoading: boolean
  error: string | null

  setSubjects: (subjects: Subject[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: {},
  subjectIds: [],
  isLoading: false,
  error: null,

  setSubjects: (subjects) =>
    set({
      subjects: subjects.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
      subjectIds: subjects.map((s) => s.id),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))

export const selectAllSubjects = (state: SubjectsState) =>
  state.subjectIds.map((id) => state.subjects[id]).filter(Boolean)
