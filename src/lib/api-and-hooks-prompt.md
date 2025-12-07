this is how api is called in my application at the moment for reference

TEACHER FILE
import { User } from "@/types/user"
import { apiFetch } from "@/lib/api/client"

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
    apiFetch(
      "/teachers",
      {
        method: "POST",
        data, // Axios handles JSON automatically
      },
      true
    ),

  update: (id: string, data: UpdateTeacherData): Promise<User> =>
    apiFetch(
      `/teachers/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ),

  delete: (id: string): Promise<void> =>
    apiFetch(
      `/teachers/${id}`,
      {
        method: "DELETE",
      },
      true
    ),
}

1. dont use react hot toast, we use sonner
2. in the compoenents use mutateAsync methos in this manner
directly in the component 
 updateTeachers = <query function>().mutateAsync

... in the handler
     await updateTeachers ()

3. you are not invalidating the necessary queries
AND KEEP TO THE FORMAT OF TEACHERS APIS I PROVIDED EARLIER
MAKE NO MISTAKES



<COPY AND PASTE ALL THE ENDPONTS FOR THAT SECTION HERE>