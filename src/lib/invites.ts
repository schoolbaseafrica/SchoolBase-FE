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
