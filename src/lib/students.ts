import { SnakeUser as User } from "@/types/user"
import { apiFetch } from "./api/client"

export type CreateStudentData = Omit<
  User,
  "id" | "avatar" | "role" | "employment_id" | "join_date"
> & {
  photo?: File
  password: string
  photo_url?: string
  registration_number?: string
  is_active?: boolean
  title?: string
  nfc_card_id?: string | null
  auto_generate_nfc_id?: boolean
}

export type UpdateStudentData = Partial<CreateStudentData>

type ResponsePack<T> = {
  data: T
  message: string
}

type MetaResponsePack<T> = {
  data: T
  message: string
  meta?: {
    total: number
    limit: number
    page: number
    total_pages: number
  }
}

export interface GetStudentsParams {
  page?: number
  search?: string
  is_active?: boolean
  class_id?: string
  limit?: number
  total?: number
}

export interface StudentsListResponse {
  data: User[]
  message: string
  meta: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  status_code: number
}

export interface StudentGrowthReport {
  academic_year: string
  report: {
    class_name: string
    new_students: number
    boys: number
    girls: number
  }[]
}

export const StudentsAPI = {
  getStudentGrowthReport: (academic_year?: string) =>
    apiFetch<ResponsePack<StudentGrowthReport>>(
      "/students/student-growth-report",
      {
        params: academic_year && academic_year.trim() ? { academic_year } : undefined,
      },
      true
    ),

  getAll: (params?: GetStudentsParams) =>
    apiFetch<MetaResponsePack<User[]>>(
      "/students",
      {
        params,
      },
      true
    ),

  getTotal: (params?: GetStudentsParams) =>
    apiFetch<StudentsListResponse>( // Remove ResponsePack wrapper
      "/students",
      {
        params,
      },
      true
    ),

  getOne: (id: string) =>
    apiFetch<ResponsePack<User>>(`/students/${id}`, undefined, true),

  create: (data: CreateStudentData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      "/students",
      {
        method: "POST",
        data,
      },
      true
    ).then((response) => response.data),

  update: (id: string, data: UpdateStudentData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      `/students/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then((response) => response.data),

  delete: (id: string): Promise<void> =>
    apiFetch(
      `/students/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  // NFC Card Operations
  bulkAssignNfcCards: (
    assignments: Array<{
      student_identifier: string
      nfc_card_id?: string
    }>
  ) =>
    apiFetch<
      ResponsePack<{
        total: number
        successful: number
        failed: number
        results: Array<{
          student_identifier: string
          success: boolean
          nfc_card_id?: string
          error?: string
        }>
      }>
    >(
      "/students/nfc-cards/bulk-assign",
      {
        method: "POST",
        data: { assignments },
      },
      true
    ),

  bulkImportNfcCards: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<
      ResponsePack<{
        total: number
        successful: number
        failed: number
        results: Array<{
          student_identifier: string
          success: boolean
          nfc_card_id?: string
          error?: string
        }>
      }>
    >(
      "/students/nfc-cards/bulk-import",
      {
        method: "POST",
        data: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        },
      },
      true
    )
  },

  validateBulkUpload: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<
      ResponsePack<{
        total_students: number
        students_with_valid_classes: number
        students_without_classes: number
        missing_classes: Array<{
          name: string
          arm?: string
          student_count: number
        }>
        existing_classes: Array<{
          name: string
          arm?: string
          student_count: number
        }>
      }>
    >(
      "/students/bulk-upload/validate",
      {
        method: "POST",
        data: formData,
      },
      true
    )
  },

  bulkUpload: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<
      ResponsePack<{
        total: number
        successful: number
        failed: number
        results: Array<{
          email: string
          success: boolean
          student?: User
          error?: string
        }>
      }>
    >(
      "/students/bulk-upload",
      {
        method: "POST",
        data: formData,
      },
      true
    )
  },

  exportNfcCardsCsv: async () => {
    const response = await fetch("/api/proxy-auth/students/nfc-cards/export-csv", {
      method: "GET",
      credentials: "include",
    })
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to export CSV" }))
      throw new Error(error.message || "Failed to export CSV")
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nfc-cards-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  generateNfcQrCode: (cardId: string) =>
    apiFetch<
      ResponsePack<{
        card_id: string
        qr_code_data_url: string
      }>
    >(
      `/students/nfc-cards/${encodeURIComponent(cardId)}/qr-code`,
      {
        method: "GET",
      },
      true
    ),
}
