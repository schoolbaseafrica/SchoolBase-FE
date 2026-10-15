import { apiFetch } from "./api/client"

type Pack<T> = T | { data: T }
const unwrap = <T>(value: Pack<T>): T =>
  value && typeof value === "object" && "data" in value ? value.data : (value as T)

export type Meeting = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  status: "scheduled" | "live" | "ended" | "cancelled"
  createdBy: string
  audienceRoles: string[]
  audienceUserIds: string[]
  audienceClassIds: string[]
}

export type MeetingDraft = {
  title: string
  description?: string
  startsAt: string
  endsAt: string
  audienceRoles: string[]
  audienceUserIds: string[]
  audienceClassIds: string[]
}

export const MeetingsAPI = {
  list: async () => unwrap(await apiFetch<Pack<Meeting[]>>("/meetings")),
  get: async (id: string) => unwrap(await apiFetch<Pack<Meeting>>(`/meetings/${id}`)),
  invitees: async (q: string) =>
    unwrap(
      await apiFetch<
        Pack<{
          users: Array<{ id: string; name: string; email: string | null; role: string[] }>
          classes: Array<{ id: string; name: string }>
        }>
      >(`/meetings/invitees?q=${encodeURIComponent(q)}`)
    ),
  create: async (draft: MeetingDraft) =>
    unwrap(await apiFetch<Pack<Meeting>>("/meetings", { method: "POST", data: draft })),
  status: async (id: string, status: "live" | "ended" | "cancelled") =>
    unwrap(
      await apiFetch<Pack<Meeting>>(`/meetings/${id}/status`, {
        method: "PATCH",
        data: { status },
      })
    ),
  token: async (id: string) =>
    unwrap(
      await apiFetch<Pack<{ token: string; url: string; host: boolean }>>(
        `/meetings/${id}/media-token`,
        { method: "POST" }
      )
    ),
  requestAdmission: async (id: string) =>
    unwrap(
      await apiFetch<Pack<{ status: string }>>(`/meetings/${id}/admission`, {
        method: "POST",
      })
    ),
  admission: async (id: string) =>
    unwrap(
      await apiFetch<
        Pack<
          | { status: string }
          | Array<{
              userId: string
              name: string
              status: string
            }>
        >
      >(`/meetings/${id}/admission`)
    ),
  decide: async (id: string, userId: string, status: "admitted" | "denied") =>
    unwrap(
      await apiFetch<Pack<{ status: string }>>(`/meetings/${id}/admission/${userId}`, {
        method: "PATCH",
        data: { status },
      })
    ),
  mute: async (id: string, userId: string) =>
    unwrap(
      await apiFetch<Pack<{ muted: boolean }>>(
        `/meetings/${id}/participants/${userId}/mute`,
        { method: "POST" }
      )
    ),
}
