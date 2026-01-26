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
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data?: unknown }).data
    if (Array.isArray(d)) return d
    if (d && typeof d === "object" && "data" in (d as object)) {
      const inner = (d as { data?: unknown }).data
      if (Array.isArray(inner)) return inner
    }
  }
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
