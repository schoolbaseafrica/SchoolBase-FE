import { apiFetch } from "../api/client"

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  middle_name?: string
  role: string[]
  gender: string
  dob: string
  phone: string
  student_id?: string
  parent_id?: string
  teacher_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  status_code: number
  message: string | null
  data: AuthUser
}

/**
 * Get current authenticated user with role-specific IDs
 */
export const getCurrentAuthUser = async (): Promise<AuthUser> => {
  try {
    const response = await apiFetch<AuthResponse>("/auth/me", {}, true)
    return response.data
  } catch (error) {
    console.error("Error fetching authenticated user:", error)
    throw error
  }
}

/**
 * Check if user has specific role
 */
export const hasRole = (user: AuthUser, role: string): boolean => {
  return user.role.includes(role.toUpperCase())
}

/**
 * Get role-specific ID (student_id, parent_id, teacher_id)
 */
export const getRoleId = (user: AuthUser): string | undefined => {
  if (hasRole(user, "STUDENT") && user.student_id) {
    return user.student_id
  }
  if (hasRole(user, "PARENT") && user.parent_id) {
    return user.parent_id
  }
  if (hasRole(user, "TEACHER") && user.teacher_id) {
    return user.teacher_id
  }
  return undefined
}

/**
 * Get user's full name
 */
export const getFullName = (user: AuthUser): string => {
  return `${user.first_name} ${user.last_name}`
}

/**
 * Get registration number or fallback
 */
export const getRegistrationNumber = (user: AuthUser): string => {
  // For students, you might want to fetch this from another endpoint
  // For now, return email or student_id as fallback
  return user.email
}
