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

export interface FirstOwner {
  owner_user_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
}

export interface OwnerOverview {
  session: { id: string; name: string }
  term_id: string | null
  active_admins: number
  inactive_admins: number
  enrolled_students: number
  results_generated: number
  attendance_records: number
  absence_late_records: number
  recent_activity_events: number
}

export const AdminsAPI = {
  getFirstOwner: () => apiFetch<ResponsePack<FirstOwner>>("/users/owner"),

  getOwnerOverview: (params: { session_id: string; term_id?: string }) =>
    apiFetch<ResponsePack<OwnerOverview>>("/users/owner/overview", { params }),

  assignFirstOwner: (ownerUserId: string) =>
    apiFetch<ResponsePack<FirstOwner>>("/users/owner", {
      method: "POST",
      data: { owner_user_id: ownerUserId },
    }),

  transferOwner: (newOwnerUserId: string) =>
    apiFetch<ResponsePack<FirstOwner>>("/users/owner/transfer", {
      method: "POST",
      data: { new_owner_user_id: newOwnerUserId },
    }),

  setAdminActive: (id: string, isActive: boolean) =>
    apiFetch<ResponsePack<User>>(
      `/users/admins/${id}/status`,
      {
        method: "PATCH",
        data: { is_active: isActive },
      },
      true
    ),

  getAll: (params?: GetAdminsParams) =>
    apiFetch<AdminsListResponse>(
      "/users/admins",
      {
        params,
      },
      true
    ),

  getTotal: (params?: GetAdminsParams) =>
    apiFetch<AdminsListResponse>(
      "/users/admins",
      {
        params,
      },
      true
    ),

  getOne: (id: string) => apiFetch<ResponsePack<User>>(`/users/${id}`, undefined, true),

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
