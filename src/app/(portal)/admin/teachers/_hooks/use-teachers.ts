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
      console.log("useGetTeachers: Fetching teachers from API...")
      setLoading(true)
      try {
        const res = await TeachersAPI.getAll({ limit: 100 }) // Backend max limit is 100
        console.log("useGetTeachers: API response:", res)
        console.log("useGetTeachers: API response structure:", {
          hasData: !!res?.data,
          dataType: typeof res?.data,
          isArray: Array.isArray(res?.data),
          nestedData: res?.data?.data,
        })
        // Handle nested response structure: ResponsePack<ResponsePack<User[]>>
        // Try multiple possible response structures
        let teachers: User[] = []
        if (Array.isArray(res?.data)) {
          teachers = res.data
        } else if (Array.isArray(res?.data?.data)) {
          teachers = res.data.data
        } else if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
          teachers = res.data.data.data
        }
        console.log("useGetTeachers: Extracted teachers:", teachers.length, teachers)
        // Ensure we always return an array
        const result = Array.isArray(teachers) ? teachers : []
        console.log(
          "useGetTeachers: Returning teachers array with length:",
          result.length
        )
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
    console.log("useGetTeachers: useEffect triggered", {
      hasData: !!query.data,
      isArray: Array.isArray(query.data),
      dataLength: query.data?.length,
      status: query.status,
      isLoading: query.isLoading,
      isError: query.isError,
    })
    if (query.data && Array.isArray(query.data)) {
      console.log(
        "useGetTeachers: Syncing query data to store, teacher count:",
        query.data.length
      )
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
      console.log("Teacher created successfully, adding to store:", newTeacher)
      // Update store instantly
      addTeacher(newTeacher)

      // Invalidate and immediately refetch to get fresh data from server
      await queryClient.invalidateQueries({
        queryKey: TEACHERS_KEY,
        refetchType: "active",
      })

      // Force refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: TEACHERS_KEY, type: "active" })

      console.log("Query invalidated and refetched")
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
  return teachers.data.data?.[0] || null
}
