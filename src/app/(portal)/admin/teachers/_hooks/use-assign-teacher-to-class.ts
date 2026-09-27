"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClassesAPI } from "@/lib/classes"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/error-handler"

const CLASSES_KEY = ["classes"]
const TEACHER_CLASSES_KEY = (teacherId: string) => ["teacher_classes", teacherId]

export function useAssignTeacherToClass() {
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
      const response = await ClassesAPI.assignTeacherToClass(
        teacherId,
        classId,
        sessionId
      )
      return response.data
    },
    onSuccess: async (data, variables) => {
      toast.success(data.message || "Teacher assigned to class successfully")
      // Invalidate and refetch relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        queryClient.invalidateQueries({ queryKey: ["class", data.class_id] }),
        queryClient.invalidateQueries({
          queryKey: TEACHER_CLASSES_KEY(variables.teacherId),
        }),
        // Also invalidate teacher attendance queries (for teacher portal) - use prefix match
        queryClient.invalidateQueries({
          queryKey: ["teacher_assigned_classes"],
          exact: false, // This will match all queries starting with this key, including those with sessionId
        }),
      ])
      // Explicitly refetch teacher assigned classes to ensure immediate update
      await queryClient.refetchQueries({
        queryKey: ["teacher_assigned_classes"],
        exact: false,
      })
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage || "Failed to assign teacher to class")
    },
  })
}
