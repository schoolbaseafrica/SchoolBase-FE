import { apiFetch } from "./api/client"

type ResponsePack<T> = { data: T }

export type ClassroomStatus = "scheduled" | "live" | "ended" | "cancelled"

export interface VirtualClassroom {
  id: string
  scheduleId: string
  classId: string
  subjectId: string | null
  teacherId: string
  sessionId: string
  termId: string | null
  title: string
  startsAt: string
  endsAt: string
  status: ClassroomStatus
  allowStudentChat: boolean
  allowStudentDraw: boolean
  whiteboardVersion: number
}

export interface ClassroomWhiteboard {
  version: number
  snapshot: Record<string, unknown>
  allowStudentDraw: boolean
}

export interface ClassroomMessage {
  id: string
  senderId: string
  senderRole: "teacher" | "student" | "admin"
  body: string
  createdAt: string
}

export interface ClassroomCollaborationTicket {
  ticket: string
  expiresInSeconds: number
  namespace: string
  classroomId: string
  canWrite: boolean
}

const unwrap = <T>(response: ResponsePack<T> | T): T =>
  response && typeof response === "object" && "data" in response
    ? (response as ResponsePack<T>).data
    : (response as T)

export const VirtualClassroomAPI = {
  list: async (sessionId?: string, termId?: string) => {
    const params = new URLSearchParams()
    if (sessionId) params.set("session_id", sessionId)
    if (termId) params.set("term_id", termId)
    return unwrap(
      await apiFetch<ResponsePack<VirtualClassroom[]> | VirtualClassroom[]>(
        `/virtual-classrooms${params.size ? `?${params}` : ""}`
      )
    )
  },
  get: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<VirtualClassroom> | VirtualClassroom>(
        `/virtual-classrooms/${id}`
      )
    ),
  create: async (data: {
    scheduleId: string
    sessionId: string
    termId?: string
    title: string
    startsAt: string
    endsAt: string
  }) =>
    unwrap(
      await apiFetch<ResponsePack<VirtualClassroom> | VirtualClassroom>(
        "/virtual-classrooms",
        { method: "POST", data }
      )
    ),
  setStatus: async (id: string, status: ClassroomStatus) =>
    unwrap(
      await apiFetch<ResponsePack<VirtualClassroom> | VirtualClassroom>(
        `/virtual-classrooms/${id}/status`,
        { method: "PATCH", data: { status } }
      )
    ),
  join: async (id: string) =>
    unwrap(await apiFetch(`/virtual-classrooms/${id}/join`, { method: "POST" })),
  leave: (id: string) => apiFetch(`/virtual-classrooms/${id}/leave`, { method: "POST" }),
  heartbeat: (id: string) =>
    apiFetch(`/virtual-classrooms/${id}/heartbeat`, { method: "POST" }),
  getCollaborationTicket: async (id: string) =>
    unwrap(
      await apiFetch<
        ResponsePack<ClassroomCollaborationTicket> | ClassroomCollaborationTicket
      >(`/virtual-classrooms/${id}/collaboration-ticket`, { method: "POST" })
    ),
  getWhiteboard: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomWhiteboard> | ClassroomWhiteboard>(
        `/virtual-classrooms/${id}/whiteboard`
      )
    ),
  updateWhiteboard: async (
    id: string,
    version: number,
    snapshot: Record<string, unknown>
  ) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomWhiteboard> | ClassroomWhiteboard>(
        `/virtual-classrooms/${id}/whiteboard`,
        { method: "PATCH", data: { version, snapshot } }
      )
    ),
  getMessages: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomMessage[]> | ClassroomMessage[]>(
        `/virtual-classrooms/${id}/messages`
      )
    ),
  sendMessage: async (id: string, body: string) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomMessage> | ClassroomMessage>(
        `/virtual-classrooms/${id}/messages`,
        { method: "POST", data: { body } }
      )
    ),
  updatePermissions: async (
    id: string,
    data: { allowStudentChat?: boolean; allowStudentDraw?: boolean }
  ) =>
    unwrap(
      await apiFetch<ResponsePack<VirtualClassroom> | VirtualClassroom>(
        `/virtual-classrooms/${id}/permissions`,
        { method: "PATCH", data }
      )
    ),
}
