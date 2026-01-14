import { apiFetch } from "./client"

export interface GenerateAccessLinkRequest {
  parent_id: string
  expires_in_hours?: number
  is_single_use?: boolean
  metadata?: Record<string, unknown>
}

export interface GenerateAccessLinkResponse {
  message: string
  status_code: number
  data: {
    id: string
    link: string
    token: string
    expires_at: string
    is_single_use: boolean
  }
}

export interface ValidateAccessLinkRequest {
  token: string
  ip_address?: string
}

export interface ValidateAccessLinkResponse {
  message: string
  status_code: number
  data: {
    access_token: string
    refresh_token: string
    session_id: string
    session_expires_at: string
    user: {
      id: string
      email: string
      first_name: string
      last_name: string
      role: string[]
    }
  }
}

export interface AccessLinkInfo {
  id: string
  created_at: string
  expires_at: string
  used_at: string | null
  used_by_ip: string | null
  is_active: boolean
  is_single_use: boolean
  created_by: {
    id: string
    name: string
  } | null
}

export interface ListAccessLinksResponse {
  message: string
  status_code: number
  data: AccessLinkInfo[]
}

export const ParentAccessLinksAPI = {
  /**
   * Generate a new access link for a parent (Admin only)
   */
  generate: async (
    parentId: string,
    data: Omit<GenerateAccessLinkRequest, "parent_id">
  ): Promise<GenerateAccessLinkResponse> => {
    return apiFetch<GenerateAccessLinkResponse>(
      `/parents/${parentId}/access-links`,
      {
        method: "POST",
        data,
      },
      true // use proxy
    )
  },

  /**
   * List all access links for a parent (Admin only)
   */
  list: async (parentId: string): Promise<ListAccessLinksResponse> => {
    return apiFetch<ListAccessLinksResponse>(
      `/parents/${parentId}/access-links`,
      {
        method: "GET",
      },
      true // use proxy
    )
  },

  /**
   * Revoke an access link (Admin only)
   */
  revoke: async (linkId: string): Promise<{ message: string; status_code: number }> => {
    return apiFetch<{ message: string; status_code: number }>(
      `/parents/access-links/${linkId}`,
      {
        method: "DELETE",
      },
      true // use proxy
    )
  },

  /**
   * Validate and use an access link (Public endpoint)
   * Uses a dedicated Next.js API route that doesn't add auth headers
   */
  validate: async (
    token: string
  ): Promise<ValidateAccessLinkResponse> => {
    return apiFetch<ValidateAccessLinkResponse>(
      `/api/parent-access-links/validate`,
      {
        method: "POST",
        data: { token },
      },
      false // Use internal Next.js API route, not proxy
    )
  },
}
