export interface SchoolInfo {
  logo: File | null
  logoPreview?: string | null
  name: string
  brandColor: string
  phone: string
  address: string
}

export interface AdminAccount {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface FormData {
  school: SchoolInfo
  admin: AdminAccount
  extra?: Record<string, string>
}

export interface Errors {
  [key: string]: string | undefined
}

export interface InstallationStep {
  label: string
  completed: boolean
}
