import { apiFetch } from "./api/client"

export type AcademicTerm = {
  id: string
  name: string
  startDate: string
  endDate: string
  sessionId: string
  session?: {
    id: string
    name: string
  }
  isActive?: boolean
  status?: "Active" | "Inactive" | string
  createdAt: string
  updatedAt?: string
}

export type PaginatedTerms = {
  data: AcademicTerm[]
  meta: {
    total: number
    limit: number
    page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  message?: string
  status_code?: number
}

export type CreateAcademicTermData = {
  name: string
  startDate: string
  endDate: string
  sessionId: string
}

export type UpdateAcademicTermData = Partial<CreateAcademicTermData>

type ApiAcademicTerm = {
  id: string
  name: string
  startDate: string
  endDate: string
  sessionId: string
  session?: {
    id: string
    name: string
  }
  isActive?: boolean
  status?: "Active" | "Inactive" | string
  createdAt: string
  updatedAt?: string
}

type PaginatedApiResponse = {
  status_code: number
  message: string
  data: ApiAcademicTerm[]
  meta: PaginatedTerms["meta"]
}

const normalizeTerm = (term: ApiAcademicTerm): AcademicTerm => ({
  ...term,
  isActive: term.isActive ?? term.status === "Active",
})

const extractTerm = (
  payload: ApiAcademicTerm | { data: ApiAcademicTerm }
): AcademicTerm => {
  const term = "data" in payload ? payload.data : payload
  return normalizeTerm(term)
}

export const AcademicTermAPI = {
  create: (data: CreateAcademicTermData) =>
    apiFetch<ApiAcademicTerm | { data: ApiAcademicTerm }>(
      "/academic-term",
      {
        method: "POST",
        data,
      },
      true
    ).then(extractTerm),

  list: (params?: { page?: number; limit?: number }) =>
    apiFetch<PaginatedApiResponse>(
      "/academic-term",
      {
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      },
      true
    ).then((res) => ({
      data: res.data.map(normalizeTerm),
      meta: res.meta,
      message: res.message,
      status_code: res.status_code,
    })),

  getOne: (id: string) =>
    apiFetch<ApiAcademicTerm | { data: ApiAcademicTerm }>(
      `/academic-term/${id}`,
      {
        method: "GET",
      },
      true
    ).then(extractTerm),

  // Get all terms for a specific session
  getBySession: (sessionId: string) =>
    apiFetch<ApiAcademicTerm[] | { data: ApiAcademicTerm[] }>(
      `/academic-term/session/${sessionId}`,
      {
        method: "GET",
      },
      true
    ).then((res) => {
      const terms = "data" in res ? res.data : res
      return Array.isArray(terms) ? terms.map(normalizeTerm) : []
    }),

  update: (id: string, data: UpdateAcademicTermData) =>
    apiFetch<ApiAcademicTerm | { data: ApiAcademicTerm }>(
      `/academic-term/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then(extractTerm),

  delete: (id: string) =>
    apiFetch<{ message?: string } | void>(
      `/academic-term/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  activate: (id: string) =>
    apiFetch<ApiAcademicTerm | { data: ApiAcademicTerm }>(
      `/academic-term/activate/${id}`,
      {
        method: "PATCH",
      },
      true
    ).then(extractTerm),

  getActive: () =>
    apiFetch<ApiAcademicTerm | { data: ApiAcademicTerm }>(
      "/academic-term/active",
      {
        method: "GET",
      },
      true
    ).then(extractTerm),
}
