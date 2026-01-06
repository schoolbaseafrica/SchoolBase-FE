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
import { extractErrorMessage } from "@/lib/error-handler"
import { useStudentsStore } from "@/store/students-store"
import { useEffect } from "react"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

// The main list query key
const STUDENTS_KEY = ["students"]

// ----------------------------
// 🔍 GET ALL STUDENTS
// ----------------------------
export function useGetStudents() {
  const setStudents = useStudentsStore((state) => state.setStudents)
  const setLoading = useStudentsStore((state) => state.setLoading)

  const query = useQuery({
    queryKey: STUDENTS_KEY, // Ignoring params for store sync
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await StudentsAPI.getAll({ limit: 1000 })
        const students = res.data
        return students
      } finally {
        setLoading(false)
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setStudents(query.data as User[])
    }
  }, [query.data, setStudents])

  return query
}

// ----------------------------
// 🔍 GET STUDENTS WITH META (PAGINATION)
// ----------------------------
export function useGetStudentsWithMeta(params?: GetStudentsParams) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, params],
    queryFn: () => StudentsAPI.getAll(params),
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// 🔍 GET STUDENT BY ID
// ----------------------------
export function useGetStudent(id?: string) {
  const studentFromStore = useStudentsStore((state) =>
    id ? state.getStudentById(id) : undefined
  )

  return useQuery({
    queryKey: [...STUDENTS_KEY, id],
    queryFn: () => StudentsAPI.getOne(id || ""),
    enabled: !!id,
    initialData: studentFromStore
      ? { data: studentFromStore, message: "From store" }
      : undefined,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// ➕ CREATE STUDENT
// ----------------------------
export function useCreateStudent() {
  const queryClient = useQueryClient()
  const addStudent = useStudentsStore((state) => state.addStudent)

  return useMutation({
    mutationFn: (data: CreateStudentData) => StudentsAPI.create(data),
    onSuccess: (newStudent) => {
      addStudent(newStudent)
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      toast.success("Student created successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ✏ UPDATE STUDENT
// ----------------------------
export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient()
  const updateStudent = useStudentsStore((state) => state.updateStudent)

  return useMutation({
    mutationFn: (data: UpdateStudentData) => StudentsAPI.update(id, data),
    onSuccess: (updatedStudent) => {
      updateStudent(id, updatedStudent)
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...STUDENTS_KEY, id] })
      toast.success("Student updated successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ❌ DELETE STUDENT
// ----------------------------
export function useDeleteStudent() {
  const queryClient = useQueryClient()
  const removeStudent = useStudentsStore((state) => state.removeStudent)

  return useMutation({
    mutationFn: (id: string) => StudentsAPI.delete(id),
    onMutate: async (id) => {
      removeStudent(id)
      await queryClient.cancelQueries({ queryKey: STUDENTS_KEY })
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY })
      const message = extractErrorMessage(error)
      toast.error(message)
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
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery({
    queryKey: ["students_count"],
    queryFn: async () => {
      const res = await StudentsAPI.getTotal({ limit: 1, page: 1 })
      return res.meta?.total ?? 0
    },
    enabled: !isSuperAdmin, // Disable for super admin
  })
}

// ----------------------------
// STUDENT GROWTH REPORT
// --------------------------
export function useStudentGrowthReport(academic_year?: string) {
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery({
    queryKey: ["student_growth_report", academic_year],
    queryFn: () => StudentsAPI.getStudentGrowthReport(academic_year),
    select: (data) => data.data,
    enabled: !isSuperAdmin, // Disable for super admin
    enabled: !!academic_year && academic_year.trim() !== "", // Only fetch when academic_year is provided and not empty
  })
}
