import { apiFetch } from "./client"

// ---------------------
// TYPES
// ---------------------

export interface CreateAdminData {
  first_name: string
  last_name: string
  email: string
  setupSecret: string
}

export interface CreateAdminResponse {
  message: string
  data: {
    email: string
  }
}

export interface SuperAdminData {
  id: string
  email: string
  first_name: string
  last_name: string
  school_name: string
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

export interface SuperAdminMeResponse {
  message: string
  status_code: number
  data: SuperAdminData
}

// ---------------------
// SUPER ADMIN API
// ---------------------

export const SuperAdminAPI = {
  // Get current super admin profile
  getMe: () =>
    apiFetch<SuperAdminMeResponse>(
      "/superadmin/me",
      {
        method: "GET",
      },
      true // Use proxy route
    ),

  // Create Admin Account
  createAdmin: (data: CreateAdminData) =>
    apiFetch<CreateAdminResponse>(
      "/auth/invites/bootstrap-admin",
      {
        method: "POST",
        headers: { "X-Initial-Setup-Secret": data.setupSecret },
        data: {
          email: data.email,
          full_name: `${data.first_name} ${data.last_name}`.trim(),
        },
      },
      true // Use proxy route
    ),

  // Logout
  logout: () =>
    apiFetch<{ message: string; status_code: number }>(
      "/api/auth/superadmin/logout",
      {
        method: "POST",
      },
      false // Don't use proxy - use specific Next.js route at /api/auth/superadmin/logout
    ),
}
