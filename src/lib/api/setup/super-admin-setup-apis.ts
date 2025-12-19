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
    id?: string
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

  // Mock landing config save (replace when real endpoint is ready)
  saveLandingConfigMock: (payload: {
    school_id: string
    landing: import("@/app/(portal)/setup/_types/setup").LandingPageConfig
  }) =>
    new Promise<{ message: string; status_code: number; data: { school_id: string } }>(
      (resolve) => {
        // Persist in localStorage for demo purposes
        if (typeof window !== "undefined") {
          const sanitizeImages = (images?: { src: string; alt: string }[]) =>
            (images ?? []).map((img) =>
              img.src?.startsWith("data:") ? { ...img, src: "" } : img
            )
          const sanitizedLanding = {
            ...payload.landing,
            hero: payload?.landing?.hero
              ? {
                  ...payload.landing.hero,
                  images: sanitizeImages(payload.landing.hero.images),
                }
              : payload?.landing?.hero,
            gallery: sanitizeImages(payload?.landing?.gallery),
            testimonials: (payload?.landing?.testimonials ?? []).map((t) => ({
              ...t,
              avatar: t?.avatar?.startsWith?.("data:") ? "" : t?.avatar,
            })),
          }
          try {
            localStorage.setItem(
              "landing-config",
              JSON.stringify({ ...payload, landing: sanitizedLanding })
            )
          } catch (error) {
            console.warn("Skipping landing-config storage (size/quota)", error)
          }
        }
        setTimeout(
          () =>
            resolve({
              message: "Landing config saved (mock)",
              status_code: 200,
              data: { school_id: payload.school_id },
            }),
          400
        )
      }
    ),

  getLandingConfigMock: (schoolId: string) =>
    new Promise<{ data?: unknown }>((resolve) => {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("landing-config")
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (parsed.school_id === schoolId) {
              resolve({ data: parsed.landing })
              return
            }
          } catch {
            // ignore
          }
        }
      }
      resolve({ data: undefined })
    }),
}
