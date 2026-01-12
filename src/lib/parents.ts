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
  limit?: number
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
    ).then((response) => response.data),

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
          parent?: User
          error?: string
        }>
      }>
    >(
      "/parents/bulk-upload",
      {
        method: "POST",
        data: formData,
      },
      true
    )
  },
}
