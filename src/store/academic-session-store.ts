import { create } from "zustand"
import { AcademicSession } from "@/lib/academic-session"

export interface AcademicSessionState {
  sessions: AcademicSession[]
  activeSession: AcademicSession | null
  isLoading: boolean
  error: string | null

  // Actions
  setSessions: (sessions: AcademicSession[]) => void
  setActiveSession: (session: AcademicSession | null) => void
  addSession: (session: AcademicSession) => void
  updateSession: (id: string, updates: Partial<AcademicSession>) => void
  removeSession: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useAcademicSessionStore = create<AcademicSessionState>((set) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,

  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (activeSession) => set({ activeSession }),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      activeSession:
        state.activeSession?.id === id
          ? { ...state.activeSession, ...updates }
          : state.activeSession,
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSession: state.activeSession?.id === id ? null : state.activeSession,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// Selectors
export const selectActiveSession = (state: AcademicSessionState) => state.activeSession
export const selectSessions = (state: AcademicSessionState) => state.sessions
