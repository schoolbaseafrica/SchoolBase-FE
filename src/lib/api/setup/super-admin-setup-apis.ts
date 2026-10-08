import { apiFetch } from "@/lib/api/client"

// ---------------------
// TYPES
// ---------------------

export interface SuperAdminSignupData {
  email: string
  first_name: string
  last_name: string
  school_name: string
  password: string
  confirm_password: string
}

export interface SuperAdminLoginData {
  email: string
  password: string
}

export interface SuperAdminResponse {
  message: string
  status_code: number
  data: Record<string, string>
}

// ---------------------
// SCHOOL INSTALLATION
// ---------------------

export interface SchoolInstallRequest {
  name: string
  address: string
  email: string
  phone: string
  logo?: File | null // File object for FormData upload
  primary_color: string
  secondary_color?: string
  accent_color?: string
  admin_first_name?: string
  admin_last_name?: string
  admin_password?: string
}

export interface SchoolInstallResponse {
  message: string
  status_code: number
  data: {
    user_id: string
    name: string
    email: string
    primary_color: string
    secondary_color?: string
    accent_color?: string
    logo: string | null
    user_type: "admin"
  }
}

// ---------------------
// DATABASE CREATION
// ---------------------

// -----------------------------------------
//        SETUP WIZARD API REQUESTS
// -----------------------------------------

export const SetupWizardAPI = {
  // Super Admin Signup
  createSuperAdmin: (data: SuperAdminSignupData, setupSecret: string) =>
    apiFetch<SuperAdminResponse>(
      "/superadmin",
      {
        method: "POST",
        data,
        headers: { "X-Initial-Setup-Secret": setupSecret },
      },
      true
    ),

  // Super Admin Login
  login: (data: SuperAdminLoginData) =>
    apiFetch<{ message: string }>(
      "/api/auth/superadmin/login",
      {
        method: "POST",
        data,
      },
      false // Don't use proxy - use specific Next.js route at /api/auth/superadmin/login
    ),

  // Install School
  installSchool: (data: SchoolInstallRequest, setupSecret: string) => {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("address", data.address)
    formData.append("email", data.email)
    formData.append("phone", data.phone)
    formData.append("primary_color", data.primary_color)
    if (data.secondary_color) {
      formData.append("secondary_color", data.secondary_color)
    }
    if (data.accent_color) {
      formData.append("accent_color", data.accent_color)
    }
    if (data.logo && typeof data.logo !== "string" && data.logo instanceof File) {
      formData.append("logo", data.logo)
    }
    if (data.admin_first_name) {
      formData.append("admin_first_name", data.admin_first_name)
    }
    if (data.admin_last_name) {
      formData.append("admin_last_name", data.admin_last_name)
    }
    if (data.admin_password) {
      formData.append("admin_password", data.admin_password)
    }

    return apiFetch<SchoolInstallResponse>(
      "/school/installation",
      {
        method: "POST",
        data: formData,
        headers: { "X-Initial-Setup-Secret": setupSecret },
        // Don't set Content-Type - client.ts will handle FormData correctly
      },
      true
    )
  },
}
