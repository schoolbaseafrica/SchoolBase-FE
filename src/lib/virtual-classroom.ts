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
  allowStudentMicrophone: boolean
  allowStudentCamera: boolean
  whiteboardVersion: number
}

export interface ClassroomMediaToken {
  token: string
  url: string
  roomName: string
  canPublish: boolean
  allowStudentMicrophone: boolean
  allowStudentCamera: boolean
  expiresInSeconds: number
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
  senderName: string | null
  body: string | null
  messageType: "text" | "voice"
  audioUrl: string | null
  audioDuration: number | null
  audioMimeType: string | null
  audioSize: number | null
  createdAt: string
}

export interface ClassroomCollaborationTicket {
  ticket: string
  expiresInSeconds: number
  namespace: string
  classroomId: string
  canWrite: boolean
  allowStudentDraw: boolean
}

export interface WhiteboardPage {
  pageKey: string
  title: string
  sortOrder: number
}

export type ClassroomAttendanceStatus = "present" | "late" | "partial" | "absent"

export interface ClassroomAttendanceStudent {
  studentId: string
  userId: string
  name: string
  registrationNumber: string
  firstJoin: string | null
  lastActivity: string | null
  connectedSeconds: number
  reconnectCount: number
  derivedStatus: ClassroomAttendanceStatus
  status: ClassroomAttendanceStatus
  adjustment: null | {
    status: ClassroomAttendanceStatus
    reason: string
    correctedBy: string
    correctedByName: string
    correctedAt: string
  }
}

export interface ClassroomAttendanceReview {
  classroom: Pick<
    VirtualClassroom,
    "id" | "title" | "status" | "sessionId" | "termId" | "startsAt" | "endsAt"
  >
  thresholds: { lateAfterMinutes: number; partialBelowPercent: number }
  summary: Record<ClassroomAttendanceStatus | "total", number>
  students: ClassroomAttendanceStudent[]
}

const unwrap = <T>(response: ResponsePack<T> | T): T =>
  response && typeof response === "object" && "data" in response
    ? (response as ResponsePack<T>).data
    : (response as T)

const toBase64Url = (value: string) =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

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
  getMediaToken: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomMediaToken> | ClassroomMediaToken>(
        `/virtual-classrooms/${id}/media-token`,
        { method: "POST" }
      )
    ),
  getWhiteboardPages: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<WhiteboardPage[]> | WhiteboardPage[]>(
        `/virtual-classrooms/${id}/whiteboard-pages`
      )
    ),
  createWhiteboardPage: async (id: string, title: string) =>
    unwrap(
      await apiFetch<ResponsePack<WhiteboardPage> | WhiteboardPage>(
        `/virtual-classrooms/${id}/whiteboard-pages`,
        { method: "POST", data: { title } }
      )
    ),
  renameWhiteboardPage: async (id: string, pageKey: string, title: string) =>
    unwrap(
      await apiFetch<ResponsePack<WhiteboardPage> | WhiteboardPage>(
        `/virtual-classrooms/${id}/whiteboard-pages/${pageKey}`,
        { method: "PATCH", data: { title } }
      )
    ),
  deleteWhiteboardPage: (id: string, pageKey: string) =>
    apiFetch(`/virtual-classrooms/${id}/whiteboard-pages/${pageKey}`, {
      method: "DELETE",
    }),
  reorderWhiteboardPages: async (id: string, pageKeys: string[]) =>
    unwrap(
      await apiFetch<ResponsePack<WhiteboardPage[]> | WhiteboardPage[]>(
        `/virtual-classrooms/${id}/whiteboard-pages`,
        { method: "PATCH", data: { pageKeys } }
      )
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
  retireLegacyWhiteboard: (id: string) =>
    apiFetch(`/virtual-classrooms/${id}/whiteboard/legacy`, { method: "DELETE" }),
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
  sendVoiceNote: async (id: string, file: Blob, duration: number) => {
    const data = new FormData()
    const extension = file.type.includes("ogg")
      ? "ogg"
      : file.type.includes("mp4")
        ? "m4a"
        : "webm"
    data.append("file", file, `voice-note.${extension}`)
    data.append("duration", String(duration))
    return unwrap(
      await apiFetch<ResponsePack<ClassroomMessage> | ClassroomMessage>(
        `/virtual-classrooms/${id}/messages/voice`,
        { method: "POST", data }
      )
    )
  },
  uploadWhiteboardImage: async (id: string, file: File) => {
    const data = new FormData()
    data.append("file", file)
    const uploaded = unwrap(
      await apiFetch<
        | ResponsePack<{ url: string; publicId: string }>
        | { url: string; publicId: string }
      >(`/virtual-classrooms/${id}/whiteboard/images`, { method: "POST", data })
    )
    return {
      ...uploaded,
      url: `/api/proxy-auth/virtual-classrooms/${id}/whiteboard/images/${toBase64Url(uploaded.publicId)}`,
    }
  },
  updatePermissions: async (
    id: string,
    data: {
      allowStudentChat?: boolean
      allowStudentDraw?: boolean
      allowStudentMicrophone?: boolean
      allowStudentCamera?: boolean
    }
  ) =>
    unwrap(
      await apiFetch<ResponsePack<VirtualClassroom> | VirtualClassroom>(
        `/virtual-classrooms/${id}/permissions`,
        { method: "PATCH", data }
      )
    ),
  moderateParticipantMedia: (
    id: string,
    participantIdentity: string,
    source: "microphone" | "camera",
    enabled: boolean
  ) =>
    apiFetch(`/virtual-classrooms/${id}/participants/media`, {
      method: "PATCH",
      data: { participantIdentity, source, enabled },
    }),
  getAttendance: async (id: string) =>
    unwrap(
      await apiFetch<ResponsePack<ClassroomAttendanceReview> | ClassroomAttendanceReview>(
        `/virtual-classrooms/${id}/attendance`
      )
    ),
  correctAttendance: async (
    id: string,
    studentUserId: string,
    data: { status: ClassroomAttendanceStatus; reason: string }
  ) =>
    unwrap(
      await apiFetch(`/virtual-classrooms/${id}/attendance/${studentUserId}`, {
        method: "PATCH",
        data,
      })
    ),
}
