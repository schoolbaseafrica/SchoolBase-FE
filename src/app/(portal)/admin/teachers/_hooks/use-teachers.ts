"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  TeachersAPI,
  CreateTeacherData,
  UpdateTeacherData,
  // GetTeachersParams,
} from "@/lib/teachers"
import type { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/error-handler"
import { useTeachersStore } from "@/store/teachers-store"
import { useEffect } from "react"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

// The main list query key - simplified
const TEACHERS_KEY = ["teachers"]

// ----------------------------
// 🔍 GET ALL TEACHERS
// ----------------------------
export function useGetTeachers() {
  const setTeachers = useTeachersStore((state) => state.setTeachers)
  const setLoading = useTeachersStore((state) => state.setLoading)
  // const setError = useTeachersStore((state) => state.setError)

  const query = useQuery({
    queryKey: TEACHERS_KEY, // Stable key, ignore filters
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await TeachersAPI.getAll({ limit: 100 }) // Backend max limit is 100
        // Handle nested response structure: ResponsePack<ResponsePack<User[]>>
        // Try multiple possible response structures
        let teachers: User[] = []
        const resData = res?.data as unknown
        if (Array.isArray(resData)) {
          teachers = resData
        } else if (resData && typeof resData === "object" && "data" in resData) {
          const nestedData = (resData as { data: unknown }).data
          if (Array.isArray(nestedData)) {
            teachers = nestedData
          } else if (
            nestedData &&
            typeof nestedData === "object" &&
            "data" in nestedData
          ) {
            const doubleNested = (nestedData as { data: unknown }).data
            if (Array.isArray(doubleNested)) {
              teachers = doubleNested
            }
          }
        }
        // Ensure we always return an array
        const result = Array.isArray(teachers) ? teachers : []
        return result
      } catch (error) {
        console.error("Failed to fetch teachers:", error)
        // Return empty array on error instead of undefined
        return []
      } finally {
        setLoading(false)
      }
    },
    staleTime: 0, // Always refetch when invalidated
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts
    // Don't set initialData - let the query fetch fresh data
  })

  // Sync with store
  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setTeachers(query.data)
    }
  }, [query.data, query.status, query.isLoading, query.isError, setTeachers])

  return query
}

// ----------------------------
// 🔍 GET TEACHER BY ID
// ----------------------------
export function useGetTeacher(id?: string) {
  // Try to get from store first
  const teacherFromStore = useTeachersStore((state) =>
    id ? state.getTeacherById(id) : undefined
  )

  return useQuery({
    queryKey: [...TEACHERS_KEY, id],
    queryFn: () => TeachersAPI.getOne(id || ""),
    enabled: !!id,
    initialData: teacherFromStore
      ? { data: teacherFromStore, message: "From store" }
      : undefined,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// ➕ CREATE TEACHER
// ----------------------------
export function useCreateTeacher() {
  const queryClient = useQueryClient()
  const addTeacher = useTeachersStore((state) => state.addTeacher)

  return useMutation({
    mutationFn: (data: CreateTeacherData) => TeachersAPI.create(data),
    onSuccess: async (newTeacher) => {
      // Update store instantly
      addTeacher(newTeacher)

      // Invalidate and immediately refetch to get fresh data from server
      await queryClient.invalidateQueries({
        queryKey: TEACHERS_KEY,
        refetchType: "active",
      })

      // Force refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: TEACHERS_KEY, type: "active" })

      toast.success("Teacher created successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ✏ UPDATE TEACHER
// ----------------------------
export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient()
  const updateTeacher = useTeachersStore((state) => state.updateTeacher)

  return useMutation({
    mutationFn: (data: UpdateTeacherData) => TeachersAPI.update(id, data),
    onSuccess: (updatedTeacher) => {
      // Update store instantly
      updateTeacher(id, updatedTeacher)

      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })
      queryClient.invalidateQueries({ queryKey: [...TEACHERS_KEY, id] })
      toast.success("Teacher updated successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ❌ DELETE TEACHER
// ----------------------------
export function useDeleteTeacher() {
  const queryClient = useQueryClient()
  const removeTeacher = useTeachersStore((state) => state.removeTeacher)

  return useMutation({
    mutationFn: (id: string) => TeachersAPI.delete(id),

    // Optimistic update
    onMutate: async (id) => {
      // Remove from store instantly
      removeTeacher(id)

      // Cancel queries
      await queryClient.cancelQueries({ queryKey: TEACHERS_KEY })
    },

    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })

      const message = extractErrorMessage(error)
      toast.error(message)
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
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery({
    queryKey: ["teachers_count", "active"],
    queryFn: async () => {
      const res = await TeachersAPI.getTotal({ is_active: true, limit: 1, page: 1 })
      return res.data?.total ?? 0
    },
    enabled: !isSuperAdmin, // Disable for super admin
  })
}

export async function findTeacherBySearch(name: string) {
  const teachers = await TeachersAPI.getAll({
    search: name,
    limit: 1,
    page: 1,
    is_active: true,
  })
  return teachers.data.data?.[0] || null
}
