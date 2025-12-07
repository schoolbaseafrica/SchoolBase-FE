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
    )
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage = error?.message?.toLowerCase() || ""

        // Handle student-specific conflicts with specific messages
        if (errorMessage.includes("email") && errorMessage.includes("already exists")) {
          throw new Error(
            "A student with this email address already exists. Please use a different email."
          )
        }

        if (
          (errorMessage.includes("registration number") ||
            errorMessage.includes("registration_number")) &&
          errorMessage.includes("already exists")
        ) {
          throw new Error(
            "A student with this registration number already exists. Please use a different registration number."
          )
        }

        if (error?.message?.includes("409") || errorMessage.includes("already exists")) {
          throw new Error("A student with these details already exists.")
        }
        throw error
      }),

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
