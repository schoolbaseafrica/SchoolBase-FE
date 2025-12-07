import { apiFetch } from "./api/client"

// ----------------------
// Types
// ----------------------
export type CreateFeeComponentData = {
  component_name: string
  description?: string
  amount: number
  term_id: string
  class_ids: string[]
}

export type UpdateFeeComponentData = Partial<CreateFeeComponentData>

// export interface FeeComponent {
//   id: string
//   component_name: string
//   description: string
//   amount: number
//   term: {
//     id: string
//     name: string
//     startDate?: string
//     endDate?: string
//   }

//   classes: { id: string; name?: string }[] | null
//   status: string
//   created_by: string
//   created_at: string
//   updated_at: string
// }

export interface FeeComponent {
  id: string
  component_name: string
  description: string
  amount: string // backend sends "16500.00" as STRING
  term_id?: string

  term: {
    id: string
    name: string
    createdAt?: string
    updatedAt?: string
    startDate?: string
    endDate?: string
    sessionId?: string
  }

  classes: { id: string; name?: string }[] | null

  status: "ACTIVE" | "INACTIVE" | string // backend uses uppercase

  createdAt: string // FIX camelCase
  updatedAt: string
  createdBy: {
    id: string
    first_name: string
    last_name: string
    middle_name?: string
  }
}

// This matches your ACTUAL API response structure
// interface FeeListData {
//   fees: FeeComponent[] | null
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }
interface FeeListData {
  fees: FeeComponent[] | null
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FeePaginationResponse {
  status_code: number
  message: string
  data: FeeListData
}

interface ResponsePack<T> {
  status_code: number
  message: string
  data: T
}

// ----------------------
// API WRAPPER
// ----------------------
export const FeesAPI = {
  // Get all fee components
  getAll: (params?: { page?: number; limit?: number }) =>
    apiFetch<FeePaginationResponse>("/fees", { params }, true),

  // Get one fee component
  getOne: (id: string) =>
    apiFetch<ResponsePack<FeeComponent>>(`/fees/${id}`, undefined, true),

  // Create fee component
  create: (body: CreateFeeComponentData) =>
    apiFetch<ResponsePack<FeeComponent>>(
      "/fees",
      {
        method: "POST",
        data: body,
      },
      true
    ),

  // Update fee component
  update: (id: string, body: UpdateFeeComponentData) =>
    apiFetch<ResponsePack<FeeComponent>>(
      `/fees/${id}`,
      {
        method: "PATCH",
        data: body,
      },
      true
    ),

  // Delete fee component
  delete: (id: string) =>
    apiFetch(
      `/fees/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  // Deactivate fee component
  deactivate: (id: string, reason: string) =>
    apiFetch<ResponsePack<FeeComponent>>(
      `/fees/${id}/deactivate`,
      {
        method: "PATCH",
        data: { reason },
      },
      true
    ),
  //  Activate fee component
  activate: (id: string, reason: string) =>
    apiFetch<ResponsePack<FeeComponent>>(
      `/fees/${id}/activate`,
      {
        method: "PATCH",
        data: { reason },
      },
      true
    ),
}
