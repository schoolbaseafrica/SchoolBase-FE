import { apiFetch } from "./api/client"

export interface InviteUserPayload {
  email: string
  role: string
  full_name: string
}

export interface InviteUserResponse {
  message: string
  status_code: number
  file_key?: string
}

export interface Invite {
  id: string
  email: string
  role: string
  status: "pending" | "used" | "failed"
  full_name: string
  accepted: boolean
  invited_at: string
  expires_at?: string
  school_id?: string
}

export interface GetInvitesParams {
  page?: number
  limit?: number
  status?: "pending" | "used" | "failed"
  role?: string
  email?: string
  invited_from?: string
  invited_to?: string
  expires_after?: string
  expires_before?: string
  sort_by?: "invited_at" | "expires_at" | "email" | "status"
  order?: "asc" | "desc"
}

export interface GetInvitesResponse {
  message: string
  status_code: number
  data: Invite[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const InvitesAPI = {
  inviteUser: (data: InviteUserPayload) =>
    apiFetch<InviteUserResponse>(
      "/auth/invites",
      {
        method: "POST",
        data,
      },
      true
    ),

  getInvites: (params?: GetInvitesParams) =>
    apiFetch<GetInvitesResponse>(
      "/auth/invites",
      {
        method: "GET",
        params,
      },
      true
    ),

  uploadCsv: (file: File, type: string) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiFetch<InviteUserResponse>(
      "/auth/invites/csv-bulk-upload",
      {
        method: "POST",
        data: formData,
        params: { type },
      },
      true
    )
  },
}
