export type UserStatus = "active" | "inactive"
export type UserType = "teachers" | "students" | "parents"

export interface User {
  id: string
  name: string
  title: string
  firstName: string
  fullName?: string
  lastName: string
  middleName?: string
  email: string
  role: string
  employeeId?: string
  regNumber?: string
  class?: string
  guardian?: string
  joinDate: string
  status: UserStatus
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  avatar?: string
  photo_url?: string
  password?: string
}

export interface SnakeUser {
  id: string
  title?: string
  first_name: string
  full_name?: string
  last_name: string
  middle_name?: string
  email: string
  role: string
  employment_id?: string
  reg_number?: string
  registration_number?: string
  class?: string
  guardian?: string
  join_date?: string
  is_active: boolean
  phone: string
  date_of_birth: string
  gender: string
  home_address: string
  avatar?: string
  photo_url?: string
  password?: string
  current_class_id?: string | null
}
