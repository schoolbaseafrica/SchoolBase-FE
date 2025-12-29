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

export function useGetTeacherClasses(teacherId: string, sessionId?: string) {
  return useQuery({
    queryKey: TEACHER_CLASSES_KEY(teacherId, sessionId),
    queryFn: async () => {
      const response = await ClassesAPI.getClassesByTeacher(teacherId, sessionId)
      return response.data || []
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
