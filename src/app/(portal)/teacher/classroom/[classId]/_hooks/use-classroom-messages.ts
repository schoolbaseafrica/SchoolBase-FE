import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ClassroomMessageAPI,
  ClassroomMessage,
  CreateMessageData,
} from "@/lib/classroom-message"

export const CLASSROOM_MESSAGES_KEY = (classId: string) => ["classroom-messages", classId]

/**
 * Get messages for a class
 */
export function useClassroomMessages(
  classId: string,
  options?: { enablePolling?: boolean }
) {
  const { enablePolling = false } = options || {}

  return useQuery({
    queryKey: CLASSROOM_MESSAGES_KEY(classId),
    queryFn: () => ClassroomMessageAPI.getByClass(classId),
    enabled: !!classId,
    staleTime: 0,
    refetchInterval: enablePolling ? 3000 : false, // Poll every 3 seconds if enabled
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
}

/**
 * Create a new message
 */
export function useCreateMessage(classId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMessageData) => {
      const messageData: CreateMessageData = {
        ...data,
        class_id: classId,
      }
      return ClassroomMessageAPI.create(messageData)
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: CLASSROOM_MESSAGES_KEY(classId) })
    },
    onError: (error: Error) => {
      console.error("Failed to create message:", error)
    },
  })
}
