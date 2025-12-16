import { SnakeUser as User } from "@/types/user"
import { apiFetch } from "./api/client"

export type CreateTeacherData = Omit<User, "id" | "avatar" | "role" | "is_active"> & {
  photo?: File
}

export type UpdateTeacherData = Partial<CreateTeacherData>

type ResponsePack<T> = {
  data: T
  message: string
}

export interface GetTeachersParams {
  is_active?: boolean
  page?: number
  search?: string
  limit?: number
  total?: number
}

export interface TeachersListResponse {
  data: User[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export const TeachersAPI = {
  getAll: (params?: GetTeachersParams) =>
    apiFetch<ResponsePack<ResponsePack<User[]>>>(
      "/teachers",
      {
        params,
      },
      true
    ),

  getTotal: (params?: GetTeachersParams) =>
    apiFetch<ResponsePack<TeachersListResponse>>(
      "/teachers",
      {
        params,
      },
      true
    ),

  getOne: (id: string) =>
    apiFetch<ResponsePack<User>>(`/teachers/${id}`, undefined, true),

  create: (data: CreateTeacherData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      "/teachers",
      {
        method: "POST",
        data,
      },
      true
    ).then((response) => response.data),

  update: (id: string, data: UpdateTeacherData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      `/teachers/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then((response) => response.data),

  delete: (id: string): Promise<void> =>
    apiFetch(
      `/teachers/${id}`,
      {
        method: "DELETE",
      },
      true
    ),
}
