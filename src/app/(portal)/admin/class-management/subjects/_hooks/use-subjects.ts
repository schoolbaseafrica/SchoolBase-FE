import { apiFetch } from "@/lib/api/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubjectsStore } from "@/store/subjects-store"
import { useEffect } from "react"
import { Subject as StoreSubject } from "@/lib/subjects"

type ResponsePack<T> = {
  data: T
  message: string
}

type Pagination = {
  has_next: boolean
  has_previous: boolean
  limit: number
  page: number
  total: number
  total_pages: number
}

export interface GetSubjectsParams {
  is_active?: boolean
  page?: number
  search?: string
  limit?: number
  total?: number
}

type SubjectCore = {
  id?: string
  name: string
}

export type Subject = {
  id: string
  name: string
  classes: {
    id: string
    name: string
    arm: string
    stream: string
    academicSession: {
      id: string
      name: string
    }
    teacher_assignment_date: string
  }[]
}

export interface SubjectsListResponse {
  data: Subject[]
  pagination: Pagination
}

export const SubjectsAPI = {
  getAll: (params?: GetSubjectsParams) =>
    apiFetch<ResponsePack<SubjectsListResponse>>(
      "/subjects",
      {
        params,
      },
      true
    ),

  getOne: (id: string) =>
    apiFetch<ResponsePack<ResponsePack<Subject>>>(
      `/subjects/${id}`,
      { method: "GET" },
      true
    ),

  create: (data: { name: string }) =>
    apiFetch<ResponsePack<ResponsePack<ResponsePack<Subject>>>>(
      "/subjects",
      {
        method: "POST",
        data,
      },
      true
    )
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage = error?.message?.toLowerCase() || ""

        if (error?.message?.includes("409") || errorMessage.includes("already exists")) {
          throw new Error("Subject with this name already exists.")
        }
        throw error
      }),

  update: (id: string, data: { name?: string }) =>
    apiFetch<ResponsePack<Subject>>(
      `/subjects/${id}`,
      {
        method: "PATCH",
        data,
      },
      true
    ),

  deleteOne: (id: string) => apiFetch(`/subjects/${id}`, { method: "DELETE" }, true),

  assignToClasses: (subjectID: string, classIDs: string[]) =>
    apiFetch<ResponsePack<null>>(
      `/subjects/${subjectID}/assign-classes`,
      {
        method: "POST",
        data: { classIds: classIDs },
      },
      true
    ),

  unAssignToClasses: (subjectID: string, classIDs: string[]) =>
    apiFetch<ResponsePack<null>>(
      `/subjects/${subjectID}/unassign-classes`,
      {
        method: "DELETE",
        data: { classIds: classIDs },
      },
      true
    ),
}

export const useGetSubjects = () => {
  const setSubjects = useSubjectsStore((state) => state.setSubjects)
  const setLoading = useSubjectsStore((state) => state.setLoading)
  // const setError = useSubjectsStore((state) => state.setError)

  // Fetch ALL subjects for client-side filtering/pagination
  // Ignoring the passed 'filters' params for the queryFn to ensure we get everything
  const query = useQuery({
    queryKey: ["subjects", "all"],
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await SubjectsAPI.getAll({ limit: 1000 })
        return res.data
      } finally {
        setLoading(false)
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data?.data) {
      setSubjects(query.data.data as unknown as StoreSubject[])
    }
  }, [query.data, setSubjects])

  return query
}

export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => SubjectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] })
    },
  })
}

export const useUpdateSubject = (subjectID: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectData: SubjectCore) =>
      SubjectsAPI.update(subjectID, { name: subjectData.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] })
      queryClient.invalidateQueries({ queryKey: ["subject", subjectID] })
    },
  })
}

export const useDeleteSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectID: string) => SubjectsAPI.deleteOne(subjectID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] })
    },
  })
}

export const useGetSubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => SubjectsAPI.getOne(subjectId).then((res) => res.data?.data),
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 20 * 60 * 1000,
  })
}

export const useAssignSubjectToClasses = (subjectID: string) => {
  const queryClient = useQueryClient()

  return useMutation<ResponsePack<null> | void, Error, string[]>({
    mutationFn: (classIDs) => {
      if (classIDs.length === 0) {
        return Promise.resolve()
      }
      return SubjectsAPI.assignToClasses(subjectID, classIDs)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", subjectID] })
    },
  })
}

export const useUnAssignSubjectToClasses = (subjectID: string) => {
  const queryClient = useQueryClient()

  return useMutation<ResponsePack<null> | void, Error, string[]>({
    mutationFn: (classIDs) => {
      if (classIDs.length === 0) {
        return Promise.resolve()
      }
      return SubjectsAPI.unAssignToClasses(subjectID, classIDs)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", subjectID] })
    },
  })
}
