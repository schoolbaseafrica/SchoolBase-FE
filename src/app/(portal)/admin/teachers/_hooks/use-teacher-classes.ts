"use client"

import { useQuery } from "@tanstack/react-query"
import { ClassesAPI } from "@/lib/classes"

export const TEACHER_CLASSES_KEY = (teacherId: string, sessionId?: string) =>
  sessionId ? ["teacher_classes", teacherId, sessionId] : ["teacher_classes", teacherId]

export interface TeacherClass {
  id: string
  name: string
  arm?: string
  academicSession?: {
    id: string
    name: string
  }
}

function parseClassesResponse(res: unknown): TeacherClass[] {
  if (Array.isArray(res)) return res
  if (!res || typeof res !== "object") return []

  const o = res as Record<string, unknown>

  // Top-level payload (e.g. { payload: [...] })
  if (Array.isArray(o.payload)) return o.payload as TeacherClass[]

  if (!("data" in o)) return []
  const d = o.data
  if (Array.isArray(d)) return d as TeacherClass[]
  if (!d || typeof d !== "object") return []

  const inner = d as Record<string, unknown>
  // Nested data.data
  if (Array.isArray(inner.data)) return inner.data as TeacherClass[]
  // Nested data.payload (paginated envelope: { data: { payload: [...], paginationMeta } })
  if (Array.isArray(inner.payload)) return inner.payload as TeacherClass[]

  return []
}

export function useGetTeacherClasses(teacherId: string, sessionId?: string) {
  return useQuery({
    queryKey: TEACHER_CLASSES_KEY(teacherId, sessionId),
    queryFn: async () => {
      const response = await ClassesAPI.getClassesByTeacher(teacherId, sessionId)
      return parseClassesResponse(response)
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
