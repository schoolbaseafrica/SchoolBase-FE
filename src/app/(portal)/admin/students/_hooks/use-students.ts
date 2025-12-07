"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  StudentsAPI,
  CreateStudentData,
  UpdateStudentData,
  GetStudentsParams,
} from "@/lib/students"
import type { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"

type ResponsePack<T> = {
  data: T
  message: string
}

type StudentsResponse = ResponsePack<ResponsePack<User[]>>

// The main list query key
const STUDENTS_KEY = ["students"]

// ----------------------------
// 🔍 GET ALL STUDENTS
// ----------------------------

export function useGetStudents(filters?: GetStudentsParams) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, filters],
    queryFn: () => StudentsAPI.getAll(filters),
    select: (data) => {
      return data.data as User[]
    },
    staleTime: 1000 * 60 * 20,
    enabled: true,
  })
}

export function useGetStudentsWithMeta(filters?: GetStudentsParams) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, filters],
    queryFn: () => StudentsAPI.getAll(filters),
    staleTime: 1000 * 60 * 20,
    enabled: true,
  })
}

// ----------------------------
// 🔍 GET STUDENT BY ID
// ----------------------------

export function useGetStudent(id?: string) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, id],
    queryFn: () => StudentsAPI.getOne(id || ""),
    enabled: !!id,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 20,
  })
}

// ----------------------------
// ➕ CREATE STUDENT
// ----------------------------

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudentData) => StudentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success("Student created successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create student")
    },
  })
}

// ----------------------------
// ✏ UPDATE STUDENT
// ----------------------------

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateStudentData) => StudentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...STUDENTS_KEY, id] })
      toast.success("Student updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update student")
    },
  })
}

// ----------------------------
// ❌ DELETE STUDENT (Optimistic Update)
// ----------------------------

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => StudentsAPI.delete(id),
    // Optimistic update for snappy UI
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: STUDENTS_KEY })
      // Get the raw query data (before select transformation)
      const previousRaw = queryClient.getQueryData(STUDENTS_KEY)
      // Update the cache with filtered data, maintaining the response structure
      queryClient.setQueryData(STUDENTS_KEY, (old: StudentsResponse | undefined) => {
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
        queryClient.setQueryData(STUDENTS_KEY, ctx.previous)
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete student")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success("Student deleted successfully")
    },
  })
}

// ----------------------------
// COUNT ACTIVE STUDENTS
// --------------------------

export function useStudentsCount() {
  return useQuery({
    queryKey: ["students_count"],
    queryFn: async () => {
      const res = await StudentsAPI.getTotal({ limit: 1, page: 1 })
      return res.meta?.total ?? 0 // Changed from res.data?.total to res.meta?.total
    },
  })
}

// ----------------------------
// STUDENT GROWTH REPORT
// --------------------------

export function useStudentGrowthReport(academic_year?: string) {
  return useQuery({
    queryKey: ["student_growth_report", academic_year],
    queryFn: () => StudentsAPI.getStudentGrowthReport(academic_year),
    select: (data) => data.data,
  })
}
