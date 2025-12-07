import { apiFetch } from "./client"
import type {
  AuthApiResponse,
  LoginPayload,
  SignUpPayload,
  UserProfileResponse,
  LoginResponse,
} from "@/types/auth"

const LOGIN_PATH = "/api/auth/login"
const ME_PATH = "/auth/me"
const LOGOUT_PATH = "/api/auth/logout"
const REFRESH_PATH = "/api/auth/refresh"

export type RefreshResponse = AuthApiResponse<Record<string, unknown>>

// ------------------------------
// Auth
// ------------------------------

export const login = (payload: LoginPayload): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>(
    LOGIN_PATH,
    {
      method: "POST",
      data: payload,
    },
    true // use proxy
  )
}

export const loginUsingEmail = (payload: {
  email: string
  password: string
}): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>(
    LOGIN_PATH,
    {
      method: "POST",
      data: payload,
    },
    true // use proxy
  )
}

export const signUp = (payload: SignUpPayload): Promise<AuthApiResponse<null>> => {
  return apiFetch<AuthApiResponse<null>>(
    "/api/auth/signup",
    {
      method: "POST",
      data: payload,
    },
    true // use proxy
  )
}

// Get current user profile
export const getProfile = async (): Promise<UserProfileResponse> => {
  const res = await apiFetch<AuthApiResponse<UserProfileResponse>>(
    ME_PATH,
    { method: "GET" },
    true
  )
  if (!res.data) throw new Error("Failed to fetch profile")
  return res.data
}

export const refresh = (): Promise<RefreshResponse> => {
  return apiFetch<RefreshResponse>(
    REFRESH_PATH,
    {
      method: "POST",
    },
    true // use proxy
  )
}

// ------------------------------
// Activate Account
// ------------------------------

export const activateAccount = (userID: string): Promise<AuthApiResponse<null>> => {
  return apiFetch<AuthApiResponse<null>>(
    `/auth/users/${userID}activate-account`,
    {
      method: "PATCH",
    },
    true // use proxy
  )
}

// ------------------------------
// Forgot Password
// ------------------------------

export const sendForgotPasswordEmail = (
  email: string
): Promise<AuthApiResponse<null>> => {
  return apiFetch<AuthApiResponse<null>>(
    "/auth/forgot-password",
    {
      method: "POST",
      data: { email },
    },
    true // use proxy
  )
}

export const sendResetPasswordRequest = (payload: {
  token: string
  newPassword: string
}): Promise<AuthApiResponse<null>> => {
  return apiFetch<AuthApiResponse<null>>(
    "/auth/reset-password",
    {
      method: "POST",
      data: payload,
    },
    true
  )
}

export type UserData = {
  id: string // UUID
  email: string
  first_name: string
  last_name: string
  role: string[] // array of roles
  middle_name: string
  gender: "MALE" | "FEMALE" | "OTHER" | "male" | "female" | "other" | null | undefined
  dob: string // ISO date (YYYY-MM-DD)
  phone: string
  is_active: boolean
  created_at: string // ISO datetime
  updated_at: string // ISO datetime
}

export const getUserData = (): Promise<AuthApiResponse<UserData>> => {
  return apiFetch<AuthApiResponse<UserData>>(
    "/auth/me",
    {
      method: "GET",
    },
    true // use proxy
  )
}

export const sendLogoutRequest = (): Promise<AuthApiResponse<null>> => {
  return apiFetch<AuthApiResponse<null>>(
    LOGOUT_PATH,
    {
      method: "POST",
    },
    true // use proxy
  )
}
