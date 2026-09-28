"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"

export const classroomKeys = {
  list: (sessionId?: string, termId?: string) => [
    "virtual-classrooms",
    sessionId,
    termId,
  ],
  detail: (id: string) => ["virtual-classroom", id],
  whiteboard: (id: string) => ["virtual-classroom", id, "whiteboard"],
  messages: (id: string) => ["virtual-classroom", id, "messages"],
}

export function useVirtualClassrooms(sessionId?: string, termId?: string) {
  return useQuery({
    queryKey: classroomKeys.list(sessionId, termId),
    queryFn: () => VirtualClassroomAPI.list(sessionId, termId),
    enabled: Boolean(sessionId),
  })
}

export function useClassroomSession(id: string) {
  return useQuery({
    queryKey: classroomKeys.detail(id),
    queryFn: () => VirtualClassroomAPI.get(id),
    enabled: Boolean(id),
    retry: false,
    refetchInterval: (query) => (query.state.data ? 10_000 : false),
  })
}

export function useClassroomPresence(id: string, enabled: boolean) {
  useEffect(() => {
    if (!id || !enabled) return
    let joined = false
    VirtualClassroomAPI.join(id).then(() => {
      joined = true
    })
    const heartbeat = window.setInterval(() => {
      if (joined) void VirtualClassroomAPI.heartbeat(id)
    }, 20_000)
    return () => {
      window.clearInterval(heartbeat)
      if (joined) void VirtualClassroomAPI.leave(id)
    }
  }, [enabled, id])
}

export function useClassroomWhiteboard(id: string) {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: classroomKeys.whiteboard(id),
    queryFn: () => VirtualClassroomAPI.getWhiteboard(id),
    enabled: Boolean(id),
    refetchInterval: 3_000,
  })
  const update = useMutation({
    mutationFn: (snapshot: Record<string, unknown>) =>
      VirtualClassroomAPI.updateWhiteboard(id, query.data?.version ?? 0, snapshot),
    onSuccess: (data) => client.setQueryData(classroomKeys.whiteboard(id), data),
    onError: () => client.invalidateQueries({ queryKey: classroomKeys.whiteboard(id) }),
  })
  return { ...query, update }
}
