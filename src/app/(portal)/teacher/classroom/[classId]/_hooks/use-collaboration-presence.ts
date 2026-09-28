import { useCallback, useEffect, useState } from "react"
import {
  classroomCollaboration,
  CollaborationCursor,
  CollaborationParticipant,
} from "@/lib/classroom-collaboration"

export function useCollaborationPresence(
  classroomId: string,
  pageKey: string,
  enabled = true
) {
  const [participants, setParticipants] = useState<CollaborationParticipant[]>([])
  const [cursors, setCursors] = useState<CollaborationCursor[]>([])

  useEffect(() => {
    if (!enabled) return
    return classroomCollaboration(classroomId, pageKey).subscribePresence(
      (nextParticipants, nextCursors) => {
        setParticipants(nextParticipants)
        setCursors(nextCursors)
      }
    )
  }, [classroomId, enabled, pageKey])

  const sendPointer = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      classroomCollaboration(classroomId, pageKey).sendAwareness({
        x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
        y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
      })
    },
    [classroomId, pageKey]
  )

  const clearPointer = useCallback(
    () => classroomCollaboration(classroomId, pageKey).sendAwareness(null),
    [classroomId, pageKey]
  )

  return { participants, cursors, sendPointer, clearPointer }
}
