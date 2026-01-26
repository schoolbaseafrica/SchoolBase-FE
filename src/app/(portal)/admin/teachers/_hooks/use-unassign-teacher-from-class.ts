"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClassesAPI } from "@/lib/classes"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/error-handler"
import { TEACHER_CLASSES_KEY } from "./use-teacher-classes"

const CLASSES_KEY = ["classes"]

export function useUnassignTeacherFromClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      teacherId,
      classId,
      sessionId,
    }: {
      teacherId: string
      classId: string
      sessionId?: string
    }) => {
      const res = await ClassesAPI.unassignTeacherFromClass(
        teacherId,
        classId,
        sessionId
      )
      return res as { message?: string } | undefined
    },
    onSuccess: async (data, variables) => {
      toast.success(
        (data && "message" in data ? data.message : undefined) ??
          "Teacher unassigned from class"
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        queryClient.invalidateQueries({
          queryKey: ["class", variables.classId],
        }),
        queryClient.invalidateQueries({
          queryKey: TEACHER_CLASSES_KEY(variables.teacherId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher_assigned_classes"],
          exact: false,
        }),
      ])
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["teacher_assigned_classes"],
          exact: false,
        }),
        queryClient.refetchQueries({
          queryKey: TEACHER_CLASSES_KEY(variables.teacherId),
        }),
      ])
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage ?? "Failed to unassign teacher from class")
    },
  })
}
