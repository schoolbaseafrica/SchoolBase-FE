"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  TeachersAPI,
  CreateTeacherData,
  UpdateTeacherData,
  GetTeachersParams,
} from "@/lib/teachers"
import type { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"

type ResponsePack<T> = {
  data: T
  message: string
}

type TeachersResponse = ResponsePack<ResponsePack<User[]>>

// The main list query key
const TEACHERS_KEY = ["teachers"]

// ----------------------------
// 🔍 GET ALL TEACHERS
// ----------------------------
export function useGetTeachers(filters?: GetTeachersParams) {
  return useQuery({
    queryKey: [...TEACHERS_KEY, filters],
    queryFn: () => TeachersAPI.getAll(filters),
    select: (data) => data.data?.data as User[],
    staleTime: 1000 * 60 * 20,
    enabled: !!filters,
  })
}

// ----------------------------
// 🔍 GET TEACHER BY ID
// ----------------------------
export function useGetTeacher(id?: string) {
  return useQuery({
    queryKey: [...TEACHERS_KEY, id],
    queryFn: () => TeachersAPI.getOne(id || ""),
    enabled: !!id,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 20,
  })
}

// ----------------------------
// ➕ CREATE TEACHER
// ----------------------------
export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTeacherData) => TeachersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })
      toast.success("Teacher created successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create teacher")
    },
  })
}

// ----------------------------
// ✏ UPDATE TEACHER
// ----------------------------
export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTeacherData) => TeachersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })
      queryClient.invalidateQueries({ queryKey: [...TEACHERS_KEY, id] })
      toast.success("Teacher updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update teacher")
    },
  })
}

// ----------------------------
// ❌ DELETE TEACHER (Optimistic Update)
// ----------------------------
export function useDeleteTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TeachersAPI.delete(id),

    // Optimistic update for snappy UI
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: TEACHERS_KEY })

      // Get the raw query data (before select transformation)
      // The query uses select, so getQueryData returns the raw response structure
      const previousRaw = queryClient.getQueryData(TEACHERS_KEY)

      // Update the cache with filtered data, maintaining the response structure
      queryClient.setQueryData(TEACHERS_KEY, (old: TeachersResponse | undefined) => {
        if (!old) return old

        // Handle the response structure: { data: { data: User[] } }
        if (old.data?.data && Array.isArray(old.data.data)) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.filter((t) => t.id !== id),
            },
          }
        }

        return old
      })

      return { previous: previousRaw }
    },

    onError: (error, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(TEACHERS_KEY, ctx.previous)
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete teacher")
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })
      toast.success("Teacher deleted successfully")
    },
  })
}

// ----------------------------
// COUNT TEACHERS
// --------------------------
export function useTeachersCount() {
  return useQuery({
    queryKey: ["teachers_count", "active"],
    queryFn: async () => {
      const res = await TeachersAPI.getTotal({ is_active: true, limit: 1, page: 1 })
      return res.data?.total ?? 0
    },
  })
}

export async function findTeacherBySearch(name: string) {
  const teachers = await TeachersAPI.getAll({
    search: name,
    limit: 1,
    page: 1,
    is_active: true,
  })
  const teacher = teachers.data?.data?.[0] || null
  return teacher
}
