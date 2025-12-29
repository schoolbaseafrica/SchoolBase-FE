export interface PaginatedData<T> {
  data: T[]
  limit: number
  page: number
  total: number
  total_pages: number
}

export type NonPaginatedData<T> = T

export interface ResponseDTO<T> {
  status_code: number
  message: string | null
  data: T
}
