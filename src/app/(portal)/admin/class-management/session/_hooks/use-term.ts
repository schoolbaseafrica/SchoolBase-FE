"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"

export interface AcademicTerm {
  id: string
  name: string
  startDate: string
  endDate: string
}

export const useAcademicTermsForSession = (sessionId?: string) => {
  return useQuery<AcademicTerm[]>({
    queryKey: ["academic-terms", sessionId],
    queryFn: async () => {
      if (!sessionId) return []

      // tell TypeScript the response type explicitly
      const res = await apiFetch<{ data: AcademicTerm[] }>(
        `/academic-term/session/${sessionId}`
      )

      // now TypeScript knows res.data exists
      return res.data
    },
    enabled: Boolean(sessionId),
  })
}

// import { useQuery } from "@tanstack/react-query"
// import { apiFetch } from "@/lib/api/client"

// export interface AcademicTerm {
//   id: string
//   name: string
//   startDate: string
//   endDate: string
// }

// export const useAcademicTermsForSession = (sessionId?: string) => {
//   return useQuery<AcademicTerm[]>({
//     queryKey: ["academic-terms", sessionId],
//     queryFn: () => fetchTermsForSession(sessionId!),
//     enabled: !!sessionId,
//   })
// }

// // export const useAcademicTermsForSession = (sessionId?: string) =>
// //   useQuery<AcademicTerm[]>({
// //     queryKey: ["academic-terms", sessionId],
// //     queryFn: async () => {
// //       if (!sessionId) return []
// //       const res = await apiFetch<{ data: AcademicTerm[] }>(
// //         `/academic-term/session/${sessionId}`
// //       )
// //       return res.data
// //     },
// //     enabled: Boolean(sessionId),
// //   })
