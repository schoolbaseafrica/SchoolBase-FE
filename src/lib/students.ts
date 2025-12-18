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
        params: { academic_year },
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
}
