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
      "/superadmin/admins",
      {
        method: "POST",
        data,
      },
      true // Use proxy route
    ),
}

