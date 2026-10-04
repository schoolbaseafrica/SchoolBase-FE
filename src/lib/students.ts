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
  class_id?: string
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
    totalPages?: number
  }
}

export interface GetStudentsParams {
  page?: number
  search?: string
  is_active?: boolean
  class_id?: string
  limit?: number
  total?: number
  session_id?: string
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
  session_id: string
  academic_year: string
  term_id?: string
  interval: "month" | "term"
  report: {
    label: string
    start_date: string
    end_date: string
    new_students: number
    cumulative_students: number
  }[]
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"'
        i++
      } else quoted = !quoted
    } else if (char === "," && !quoted) {
      row.push(cell)
      cell = ""
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ""
    } else cell += char
  }
  if (quoted) throw new Error("CSV contains an unclosed quote")
  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

export const StudentsAPI = {
  getFaceReference: (id: string) =>
    apiFetch<
      ResponsePack<{
        studentId: string
        photoUrl: string | null
        canApprove: boolean
        approvedAt: string | null
      }>
    >(`/attendance/mobile/students/${id}/face-reference`).then(
      (response) => response.data
    ),
  approveFaceReference: (id: string) =>
    apiFetch<ResponsePack<{ studentId: string; approvedAt: string }>>(
      `/attendance/mobile/students/${id}/face-reference/approve`,
      { method: "POST" }
    ).then((response) => response.data),
  revokeFaceReference: (id: string) =>
    apiFetch<ResponsePack<{ studentId: string; approvedAt: null }>>(
      `/attendance/mobile/students/${id}/face-reference/approval`,
      { method: "DELETE" }
    ).then((response) => response.data),
  getNfcCard: (id: string) =>
    apiFetch<ResponsePack<{ studentId: string; cardId: string | null }>>(
      `/attendance/mobile/students/${id}/card`,
      undefined,
      true
    ).then((response) => response.data),
  assignNfcCard: (id: string, cardId: string) =>
    apiFetch<ResponsePack<{ studentId: string; cardId: string }>>(
      `/attendance/mobile/students/${id}/card`,
      { method: "POST", data: { cardId } },
      true
    ).then((response) => response.data),

  removeNfcCard: (id: string) =>
    apiFetch<ResponsePack<{ studentId: string; cardId: null }>>(
      `/attendance/mobile/students/${id}/card`,
      { method: "DELETE" },
      true
    ).then((response) => response.data),
  getStudentGrowthReport: (params: {
    session_id: string
    term_id?: string
    interval: "month" | "term"
  }) =>
    apiFetch<ResponsePack<StudentGrowthReport>>(
      "/students/student-growth-report",
      {
        params,
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
    ).then((response) => ({
      ...response,
      meta: response.meta
        ? {
            ...response.meta,
            total_pages: response.meta.total_pages ?? response.meta.totalPages ?? 1,
          }
        : response.meta,
    })),

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
      "/attendance/mobile/students/cards/bulk-assign",
      {
        method: "POST",
        data: { assignments },
      },
      true
    ),

  bulkImportNfcCards: async (file: File) => {
    const rows = parseCsv(await file.text())
    if (rows.length < 2) throw new Error("CSV contains no student rows")
    if (rows.length > 501) throw new Error("Import at most 500 cards at once")
    const headers = rows[0].map((value) =>
      value
        .trim()
        .toLowerCase()
        .replace(/^\uFEFF/, "")
    )
    if (headers[0] !== "registration number" || headers[2] !== "nfc card id") {
      throw new Error("Expected columns: Registration Number, Student Name, NFC Card ID")
    }
    return StudentsAPI.bulkAssignNfcCards(
      rows.slice(1).map((row) => ({
        student_identifier: row[0]?.trim() || "",
        nfc_card_id: row[2]?.trim() || undefined,
      }))
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
    const response = await fetch(
      "/api/proxy-auth/attendance/mobile/students/cards/export-csv",
      {
        method: "GET",
        credentials: "include",
      }
    )
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

  generateNfcQrCode: (studentId: string) =>
    apiFetch<
      ResponsePack<{
        card_id: string
        qr_code_data_url: string
      }>
    >(`/attendance/mobile/students/${studentId}/card/qr`, undefined, true).then(
      (response) => response.data
    ),
}
