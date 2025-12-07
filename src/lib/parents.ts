import { SnakeUser as User } from "@/types/user"
import { apiFetch } from "./api/client"

export type CreateParentData = Omit<
  User,
  | "id"
  | "avatar"
  | "role"
  | "employment_id"
  | "join_date"
  | "reg_number"
  | "class"
  | "guardian"
> & {
  photo?: File
  relationship?: string
  password: string
  photo_url?: string
  title?: string
}

export type UpdateParentData = Partial<CreateParentData>

type ResponsePack<T> = {
  data: T
  message: string
}

export interface GetParentsParams {
  is_active?: boolean
  page?: number
  search?: string
}

interface LinkedResponse {
  parent_id: string
  linked_students: string[]
  total_linked: number
}

export const ParentsAPI = {
  getAll: (params?: GetParentsParams) =>
    apiFetch<ResponsePack<ResponsePack<User[]>>>(
      "/parents",
      {
        params,
      },
      true
    ),

  getOne: (id: string) => apiFetch<ResponsePack<User>>(`/parents/${id}`, undefined, true),

  create: (data: CreateParentData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      "/parents",
      {
        method: "POST",
        data,
      },
      true
    )
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage = error?.message?.toLowerCase() || ""

        // Handle parent-specific conflicts with specific messages
        if (errorMessage.includes("email") && errorMessage.includes("already exists")) {
          throw new Error(
            "A parent with this email address already exists. Please use a different email."
          )
        }

        if (error?.message?.includes("409") || errorMessage.includes("already exists")) {
          throw new Error("A parent with these details already exists.")
        }
        throw error
      }),

  update: (id: string, data: UpdateParentData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      `/parents/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then((response) => response.data),

  getLinkedStudents: (id: string) =>
    apiFetch<ResponsePack<User[]>>(
      `/parents/admin/${id}/students`,
      { method: "GET" },
      true
    ),

  linkToStudents: (id: string, student_ids: string[]) =>
    apiFetch<ResponsePack<LinkedResponse>>(
      `/parents/${id}/link-students`,
      {
        method: "POST",
        data: { student_ids },
      },
      true
    ),

  delete: (id: string): Promise<void> =>
    apiFetch(
      `/parents/${id}`,
      {
        method: "DELETE",
      },
      true
    ),
}
