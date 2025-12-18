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
      setLoading(true)
      try {
        const res = await TeachersAPI.getAll({ limit: 1000 }) // Fetch enough data
        return res
      } finally {
        setLoading(false)
      }
    },
    select: (data) => data.data.data, // Select just the array
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Sync with store
  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setTeachers(query.data)
    }
  }, [query.data, setTeachers])

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
    onSuccess: (newTeacher) => {
      // Update store instantly
      addTeacher(newTeacher)

      // Invalidate query to ensure consistency
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY })
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
