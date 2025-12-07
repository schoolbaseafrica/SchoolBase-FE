import { apiFetch } from "./api/client"

// -------------------------
// Types
// -------------------------

// export type AcademicSession = {
//   id: string
//   name: string
//   startDate: string
//   endDate: string
//   isActive: boolean
//   status?: "Active" | "Inactive" | "Archived" | string
//   createdAt: string
//   updatedAt?: string
//   description?: string
// }
export type AcademicTerm = {
  id?: string
  name: "First term" | "Second term" | "Third term" | string
  startDate: string
  endDate: string
  status?: "Active" | "Inactive" | string
  isCurrent?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type AcademicSession = {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  status?: "Active" | "Inactive" | "Archived" | string
  createdAt: string
  updatedAt?: string
  description?: string
  terms?: AcademicTerm[] // <-- added
}

export type PaginatedSessions = {
  data: AcademicSession[]
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

// Create / Update Types
export type CreateAcademicSessionData = {
  description?: string
  terms: {
    first_term: {
      startDate: string
      endDate: string
    }
    second_term: {
      startDate: string
      endDate: string
    }
    third_term: {
      startDate: string
      endDate: string
    }
  }
}

export type UpdateAcademicSessionData = Partial<CreateAcademicSessionData>

// type ApiAcademicSession = {
//   id: string
//   name: string
//   startDate: string
//   endDate: string
//   status?: "Active" | "Inactive" | "Archived" | string
//   isActive?: boolean
//   createdAt: string
//   updatedAt?: string
//   description?: string
// }

type ApiAcademicSession = {
  id: string
  name: string
  startDate: string
  endDate: string
  status?: "Active" | "Inactive" | "Archived" | string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
  description?: string
  terms?: AcademicTerm[] // <-- added
}

type PaginatedApiResponse = {
  status_code: number
  message: string
  data: ApiAcademicSession[]
  meta: PaginatedSessions["meta"]
}

// -------------------------
// Normalizers
// -------------------------

// const normalizeSession = (session: ApiAcademicSession): AcademicSession => {
//   const inferredActive = session.status === "Active" || session.isActive === true

//   return {
//     ...session,
//     isActive: inferredActive,
//     status: session.status ?? (inferredActive ? "Active" : "Inactive"),
//   }
// }
const normalizeSession = (session: ApiAcademicSession): AcademicSession => {
  const inferredActive = session.status === "Active" || session.isActive === true

  return {
    ...session,
    isActive: inferredActive,
    status: session.status ?? (inferredActive ? "Active" : "Inactive"),
    terms: session.terms ?? [], // <-- ensures terms array exists
  }
}

const extractSession = (
  payload: ApiAcademicSession | { data: ApiAcademicSession }
): AcademicSession => {
  const session = "data" in payload ? payload.data : payload
  return normalizeSession(session)
}

// -------------------------
// API
// -------------------------

export const AcademicSessionAPI = {
  create: (data: CreateAcademicSessionData) =>
    apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
      "/academic-session",
      {
        method: "POST",
        data,
      },
      true
    ).then(extractSession),

  list: (params?: { page?: number; limit?: number }) =>
    apiFetch<PaginatedApiResponse>(
      "/academic-session",
      {
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      },
      true
    ).then((res) => ({
      data: res.data.map(normalizeSession),
      meta: res.meta,
      message: res.message,
      status_code: res.status_code,
    })),

  getOne: (id: string) =>
    apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
      `/academic-session/${id}`,
      {
        method: "GET",
      },
      true
    ).then(extractSession),

  update: (id: string, data: UpdateAcademicSessionData) =>
    apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
      `/academic-session/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then(extractSession),

  delete: (id: string) =>
    apiFetch<{ message?: string } | void>(
      `/academic-session/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  activate: (id: string) =>
    apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
      `/academic-session/activate/${id}`,
      {
        method: "PATCH",
      },
      true
    ).then(extractSession),

  getActive: () =>
    apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
      "/academic-session/active",
      {
        method: "GET",
      },
      true
    ).then(extractSession),
}

// import { apiFetch } from "./api/client"

// export type AcademicSession = {
//   id: string
//   name: string
//   startDate: string
//   endDate: string
//   isActive: boolean
//   status: "Active" | "Inactive" | "Archived"
//   createdAt: string
//   updatedAt?: string
// }

// export type PaginatedSessions = {
//   data: AcademicSession[]
//   meta: {
//     total: number
//     limit: number
//     page: number
//     total_pages: number
//     has_next: boolean
//     has_previous: boolean
//   }
//   message?: string
//   status_code?: number
// }

// export type CreateAcademicSessionData = {
//   description?: string
//   terms: {
//     first_term: {
//       startDate: string
//       endDate: string
//     }
//     second_term: {
//       startDate: string
//       endDate: string
//     }
//     third_term: {
//       startDate: string
//       endDate: string
//     }
//   }
// }

// export type UpdateAcademicSessionData = Partial<CreateAcademicSessionData>

// type ApiAcademicSession = {
//   id: string
//   name: string
//   startDate: string
//   endDate: string
//   status?: "Active" | "Inactive" | "Archived" | string
//   isActive?: boolean
//   createdAt: string
//   updatedAt?: string
// }

// type PaginatedApiResponse = {
//   status_code: number
//   message: string
//   data: ApiAcademicSession[]
//   meta: PaginatedSessions["meta"]
// }

// const normalizeSession = (session: ApiAcademicSession): AcademicSession => ({
//   ...session,
//   isActive: session.isActive ?? session.status === "Active",
// })

// const extractSession = (
//   payload: ApiAcademicSession | { data: ApiAcademicSession }
// ): AcademicSession => {
//   const session = "data" in payload ? payload.data : payload
//   return normalizeSession(session)
// }

// export const AcademicSessionAPI = {
//   create: (data: CreateAcademicSessionData) =>
//     apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
//       "/academic-session",
//       {
//         method: "POST",
//         data,
//       },
//       true
//     ).then(extractSession),

//   list: (params?: { page?: number; limit?: number }) =>
//     apiFetch<PaginatedApiResponse>(
//       "/academic-session",
//       {
//         method: "GET",
//         params: {
//           page: params?.page ?? 1,
//           limit: params?.limit ?? 20,
//         },
//       },
//       true
//     ).then((res) => ({
//       data: res.data.map(normalizeSession),
//       meta: res.meta,
//       message: res.message,
//       status_code: res.status_code,
//     })),

//   getOne: (id: string) =>
//     apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
//       `/academic-session/${id}`,
//       {
//         method: "GET",
//       },
//       true
//     ).then(extractSession),

//   update: (id: string, data: UpdateAcademicSessionData) =>
//     apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
//       `/academic-session/${id}`,
//       {
//         method: "PATCH",
//         data,
//       },
//       true
//     ).then(extractSession),

//   delete: (id: string) =>
//     apiFetch<{ message?: string } | void>(
//       `/academic-session/${id}`,
//       {
//         method: "DELETE",
//       },
//       true
//     ),

//   activate: (id: string) =>
//     apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
//       `/academic-session/activate/${id}`,
//       {
//         method: "PATCH",
//       },
//       true
//     ).then(extractSession),

//   getActive: () =>
//     apiFetch<ApiAcademicSession | { data: ApiAcademicSession }>(
//       "/academic-session/active",
//       {
//         method: "GET",
//       },
//       true
//     ).then(extractSession),
// }
