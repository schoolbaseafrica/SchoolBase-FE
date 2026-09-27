import { useCallback, useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UpdateWhiteboardData, WhiteboardResponse } from "@/lib/whiteboard"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"
import {
  classroomCollaboration,
  CollaborationStatus,
} from "@/lib/classroom-collaboration"
import { toast } from "sonner"

export const WHITEBOARD_KEY = (classroomId: string, pageKey = "main") => [
  "classroom-whiteboard",
  classroomId,
  pageKey,
]

type SessionWhiteboard = WhiteboardResponse & { version: number }

const normalize = (
  classroomId: string,
  data: { version: number; snapshot: Record<string, unknown>; allowStudentDraw: boolean }
): SessionWhiteboard => ({
  id: classroomId,
  class_id: classroomId,
  canvas_state: (data.snapshot.canvas_state as string | null) ?? null,
  excalidraw_elements:
    (data.snapshot.excalidraw_elements as Record<string, unknown>[]) ?? [],
  images_data: (data.snapshot.images_data as WhiteboardResponse["images_data"]) ?? {},
  videos_data: (data.snapshot.videos_data as WhiteboardResponse["videos_data"]) ?? {},
  text_boxes: (data.snapshot.text_boxes as WhiteboardResponse["text_boxes"]) ?? [],
  is_active: true,
  allow_student_edit: data.allowStudentDraw,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: data.version,
})

export function useWhiteboard(classroomId: string, pageKey = "main") {
  const queryClient = useQueryClient()
  const [collaborationStatus, setCollaborationStatus] =
    useState<CollaborationStatus>("connecting")
  const query = useQuery({
    queryKey: WHITEBOARD_KEY(classroomId, pageKey),
    queryFn: async () => {
      const legacy = await VirtualClassroomAPI.getWhiteboard(classroomId)
      return normalize(classroomId, {
        ...legacy,
        snapshot: pageKey === "main" ? legacy.snapshot : {},
      })
    },
    enabled: Boolean(classroomId),
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
  useEffect(() => {
    if (!classroomId) return
    const collaboration = classroomCollaboration(classroomId, pageKey)
    return collaboration.subscribe((snapshot, status, allowStudentDraw) => {
      setCollaborationStatus(status)
      if (!Object.keys(snapshot).length) return
      const current = queryClient.getQueryData<SessionWhiteboard>(
        WHITEBOARD_KEY(classroomId, pageKey)
      )
      queryClient.setQueryData(
        WHITEBOARD_KEY(classroomId, pageKey),
        normalize(classroomId, {
          version: current?.version ?? 0,
          snapshot,
          allowStudentDraw: allowStudentDraw ?? current?.allow_student_edit ?? false,
        })
      )
    })
  }, [classroomId, pageKey, queryClient])
  useEffect(() => {
    if (!query.data || !classroomId) return
    if (pageKey !== "main") return
    classroomCollaboration(classroomId, pageKey).seed({
      canvas_state: query.data.canvas_state,
      images_data: query.data.images_data,
      videos_data: query.data.videos_data,
      text_boxes: query.data.text_boxes,
    })
  }, [classroomId, pageKey, query.data])
  return { ...query, collaborationStatus }
}

export function useUpdateWhiteboard(classroomId: string, pageKey = "main") {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateWhiteboardData) => {
      const current = queryClient.getQueryData<SessionWhiteboard>(
        WHITEBOARD_KEY(classroomId, pageKey)
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
      classroomCollaboration(classroomId, pageKey).update(snapshot)
      return normalize(classroomId, {
        version: current?.version ?? 0,
        snapshot,
        allowStudentDraw: current?.allow_student_edit ?? false,
      })
    },
    onSuccess: (data) =>
      queryClient.setQueryData(WHITEBOARD_KEY(classroomId, pageKey), data),
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update whiteboard"),
  })
}

export function useUpdateWhiteboardElements(classroomId: string, pageKey = "main") {
  return useCallback(
    (elements: ReadonlyArray<Record<string, unknown>>) => {
      classroomCollaboration(classroomId, pageKey).updateElements(elements)
    },
    [classroomId, pageKey]
  )
}
