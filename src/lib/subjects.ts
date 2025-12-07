import { apiFetch } from "./api/client"

export interface Subject {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface SubjectsResponse {
  data: Subject[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

type ResponsePack<T> = {
  status_code: number
  message: string
  data: T
}

export const SubjectsAPI = {
  getAll: () => apiFetch<ResponsePack<SubjectsResponse>>("/subjects", undefined, true),
}
