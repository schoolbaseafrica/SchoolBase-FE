import { SnakeUser as User } from "@/types/user"
import { apiFetch } from "./api/client"

export type CreateAdminData = Omit<User, "id" | "avatar" | "role" | "is_active"> & {
  photo?: File
}

export type UpdateAdminData = Partial<CreateAdminData>

type ResponsePack<T> = {
  data: T
  message: string
}

export interface GetAdminsParams {
  is_active?: boolean
  page?: number
  search?: string
  limit?: number
  total?: number
}

export interface AdminsListResponse {
  data: User[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export const AdminsAPI = {
  getAll: (params?: GetAdminsParams) =>
    apiFetch<ResponsePack<ResponsePack<User[]>>>(
      "/users/admins",
      {
        params,
      },
      true
    ),

  getTotal: (params?: GetAdminsParams) =>
    apiFetch<ResponsePack<AdminsListResponse>>(
      "/users/admins",
      {
        params,
      },
      true
    ),

  getOne: (id: string) =>
    apiFetch<ResponsePack<User>>(`/users/${id}`, undefined, true),

  create: (data: CreateAdminData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      "/users",
      {
        method: "POST",
        data: {
          ...data,
          role: ["ADMIN"],
        },
      },
      true
    ).then((response) => response.data),

  update: (id: string, data: UpdateAdminData): Promise<User> =>
    apiFetch<ResponsePack<User>>(
      `/users/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then((response) => response.data),

  delete: (id: string): Promise<void> =>
    apiFetch(
      `/users/${id}`,
      {
        method: "DELETE",
      },
      true
    ),
}
