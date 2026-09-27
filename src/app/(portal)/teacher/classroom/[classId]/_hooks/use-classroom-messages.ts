import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ClassroomMessage, CreateMessageData } from "@/lib/classroom-message"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"

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
    queryFn: async () =>
      (await VirtualClassroomAPI.getMessages(classId)).map<ClassroomMessage>(
        (message) => ({
          id: message.id,
          class_id: classId,
          sender_type: message.senderRole === "student" ? "student" : "teacher",
          sender_id: message.senderId,
          sender_name: message.senderRole === "student" ? "Student" : "Teacher",
          text: message.body,
          audio_url: null,
          audio_duration: null,
          createdAt: message.createdAt,
          updatedAt: message.createdAt,
        })
      ),
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
      if (!data.text?.trim()) throw new Error("A text message is required")
      return VirtualClassroomAPI.sendMessage(classId, data.text)
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
