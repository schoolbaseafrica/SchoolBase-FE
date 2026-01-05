import { apiFetch } from "./client"

// ---------------------
// TYPES
// ---------------------

export interface CreateAdminData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password?: string
}

export interface CreateAdminResponse {
  message: string
  status_code: number
  data: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    is_active: boolean
    is_verified: boolean
    created_at: string
  }
}

// ---------------------
// SUPER ADMIN API
// ---------------------

export const SuperAdminAPI = {
  // Create Admin Account
  createAdmin: (data: CreateAdminData) =>
    apiFetch<CreateAdminResponse>(
      "/superadmin/admins",
      {
        method: "POST",
        data,
      },
      true // Use proxy route
    ),
}

