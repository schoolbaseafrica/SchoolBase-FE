export interface UserProfileNew {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string[]
  middle_name?: string | null | undefined
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  dob?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
  photo_url?: string
  homeAddress?: string
}

export interface UpdateProfileRequestNew {
  first_name?: string
  last_name?: string
  middle_name?: string | null
  phone?: string
  photo_url?: string
  homeAddress?: string
}

// API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  status?: string
}
