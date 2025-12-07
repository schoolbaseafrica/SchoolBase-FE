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
  logo?: string | null
  primary_color: string
  secondary_color?: string
  accent_color?: string
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

export interface DatabaseCreateRequest {
  database_name: string
  database_host: string
  database_port: number
  database_type: string
  database_username: string
  database_password: string
}

export interface DatabaseCreateResponse {
  status_code: number
  message: string
  data: {
    id: string
    database_name: string
    database_host: string
    database_username: string
    database_port: number
    created_at: string
    updated_at: string
  }
}

// -----------------------------------------
//        SETUP WIZARD API REQUESTS
// -----------------------------------------

export const SetupWizardAPI = {
  // Super Admin Signup
  createSuperAdmin: (data: SuperAdminSignupData) =>
    apiFetch<SuperAdminResponse>(
      "/superadmin",
      {
        method: "POST",
        data,
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
      true
    ),

  // Install School
  installSchool: (data: SchoolInstallRequest) =>
    apiFetch<SchoolInstallResponse>(
      "/school/installation",
      {
        method: "POST",
        data,
      },
      true
    ),

  // Create Database
  createDatabase: (data: DatabaseCreateRequest) =>
    apiFetch<DatabaseCreateResponse>(
      "/database",
      {
        method: "POST",
        data,
      },
      true
    ),
}
