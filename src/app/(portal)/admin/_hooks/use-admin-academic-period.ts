"use client"

import { useMemo } from "react"
import { useAdminAcademicPeriodStore } from "@/store/admin-academic-period-store"
import {
  useAcademicSessions,
  useActiveAcademicSession,
} from "../class-management/session/_hooks/use-session"
import {
  useAcademicTermsForSession,
  useActiveAcademicTerm,
} from "../class-management/_hooks/use-academic-term"

export function useAdminAcademicPeriod() {
  const { sessionId, termId, setPeriod, setTermId, reset } = useAdminAcademicPeriodStore()
  const sessionsQuery = useAcademicSessions({ limit: 100 })
  const activeSessionQuery = useActiveAcademicSession()
  const activeTermQuery = useActiveAcademicTerm()

  const sessions = useMemo(
    () => sessionsQuery.data?.data ?? [],
    [sessionsQuery.data?.data]
  )
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === sessionId),
    [sessions, sessionId]
  )
  const effectiveSession = selectedSession ?? activeSessionQuery.data ?? null
  const termsQuery = useAcademicTermsForSession(effectiveSession?.id)
  const terms = useMemo(() => termsQuery.data ?? [], [termsQuery.data])

  const selectedTerm = useMemo(() => {
    if (termId === "all") return null
    if (termId) return terms.find((term) => term.id === termId) ?? null
    const activeTerm = activeTermQuery.data
    return terms.some((term) => term.id === activeTerm?.id) ? activeTerm : null
  }, [activeTermQuery.data, termId, terms])

  return {
    sessions,
    terms,
    activeSession: activeSessionQuery.data ?? null,
    activeTerm: activeTermQuery.data ?? null,
    session: effectiveSession,
    term: selectedTerm,
    sessionId: effectiveSession?.id,
    termId: selectedTerm?.id,
    termSelection: termId === "all" ? "all" : selectedTerm?.id ? selectedTerm.id : "all",
    isWholeSession: termId === "all" || !selectedTerm,
    isLoading:
      sessionsQuery.isLoading ||
      activeSessionQuery.isLoading ||
      (!!effectiveSession?.id && termsQuery.isLoading),
    setSession: (nextSessionId: string) => {
      const nextActiveTerm =
        nextSessionId === activeSessionQuery.data?.id &&
        activeTermQuery.data?.sessionId === nextSessionId
          ? activeTermQuery.data.id
          : "all"
      setPeriod(nextSessionId, nextActiveTerm)
    },
    setTerm: setTermId,
    reset,
  }
}
