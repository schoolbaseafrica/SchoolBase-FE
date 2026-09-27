import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UpdateWhiteboardData, WhiteboardResponse } from "@/lib/whiteboard"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"
import { toast } from "sonner"

export const WHITEBOARD_KEY = (classroomId: string) => [
  "classroom-whiteboard",
  classroomId,
]

type SessionWhiteboard = WhiteboardResponse & { version: number }

const normalize = (
  classroomId: string,
  data: { version: number; snapshot: Record<string, unknown>; allowStudentDraw: boolean }
): SessionWhiteboard => ({
  id: classroomId,
  class_id: classroomId,
  canvas_state: (data.snapshot.canvas_state as string | null) ?? null,
  images_data: (data.snapshot.images_data as WhiteboardResponse["images_data"]) ?? {},
  videos_data: (data.snapshot.videos_data as WhiteboardResponse["videos_data"]) ?? {},
  text_boxes: (data.snapshot.text_boxes as WhiteboardResponse["text_boxes"]) ?? [],
  is_active: true,
  allow_student_edit: data.allowStudentDraw,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: data.version,
})

export function useWhiteboard(
  classroomId: string,
  options?: { enablePolling?: boolean }
) {
  return useQuery({
    queryKey: WHITEBOARD_KEY(classroomId),
    queryFn: async () =>
      normalize(classroomId, await VirtualClassroomAPI.getWhiteboard(classroomId)),
    enabled: Boolean(classroomId),
    staleTime: 0,
    refetchInterval: options?.enablePolling ? 3_000 : false,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateWhiteboard(classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateWhiteboardData) => {
      const current = queryClient.getQueryData<SessionWhiteboard>(
        WHITEBOARD_KEY(classroomId)
      )
      if (data.allow_student_edit !== undefined) {
        await VirtualClassroomAPI.updatePermissions(classroomId, {
          allowStudentDraw: data.allow_student_edit,
        })
      }
      const snapshotChanged = Object.keys(data).some(
        (key) => key !== "allow_student_edit"
      )
      if (!snapshotChanged) {
        return {
          ...current,
          allow_student_edit: data.allow_student_edit,
        } as SessionWhiteboard
      }
      const snapshot: Record<string, unknown> = {
        canvas_state: current?.canvas_state ?? null,
        images_data: current?.images_data ?? {},
        videos_data: current?.videos_data ?? {},
        text_boxes: current?.text_boxes ?? [],
        ...data,
      }
      delete snapshot.allow_student_edit
      const result = await VirtualClassroomAPI.updateWhiteboard(
        classroomId,
        current?.version ?? 0,
        snapshot
      )
      return normalize(classroomId, {
        ...result,
        allowStudentDraw: current?.allow_student_edit ?? false,
      })
    },
    onSuccess: (data) => queryClient.setQueryData(WHITEBOARD_KEY(classroomId), data),
    onError: (error: Error) => {
      void queryClient.invalidateQueries({ queryKey: WHITEBOARD_KEY(classroomId) })
      toast.error(error.message || "Failed to update whiteboard")
    },
  })
}
