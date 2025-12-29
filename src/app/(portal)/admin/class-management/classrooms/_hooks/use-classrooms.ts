"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ClassroomsAPI } from "@/lib/classrooms"
import type {
  Classroom,
  CreateClassroomData,
  UpdateClassroomData,
  GetClassroomsParams,
} from "@/types/classroom"
import { toast } from "sonner"

// Define the response type for optimistic updates
interface ClassroomsQueryData {
  data: {
    rooms: Classroom[]
  }
}

const CLASSROOMS_KEY = ["classrooms"]

export function useGetClassrooms(filters?: GetClassroomsParams) {
  return useQuery({
    queryKey: [...CLASSROOMS_KEY, filters],
    queryFn: async () => {
      try {
        const response = await ClassroomsAPI.getAll(filters)
        return response
      } catch (error) {
        console.error("Error fetching classrooms:", error)
        throw error
      }
    },
    select: (data) => {
      // Handle different possible response structures
      if (!data) return [] as Classroom[]

      // Structure 1: { data: { rooms: [...] } }
      if (data.data && Array.isArray(data.data.rooms)) {
        return data.data.rooms as Classroom[]
      }

      // Structure 2: { data: [...] } (direct array)
      if (data.data && Array.isArray(data.data)) {
        return data.data as Classroom[]
      }

      // Structure 3: Direct array
      if (Array.isArray(data)) {
        return data as Classroom[]
      }

      // Fallback: empty array
      console.warn("Unexpected classrooms response structure:", data)
      return [] as Classroom[]
    },
    staleTime: 1000 * 60 * 20,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    initialData: undefined, // Don't set initialData to prevent stale data
  })
}

export function useGetClassroom(id?: string) {
  return useQuery({
    queryKey: [...CLASSROOMS_KEY, id],
    queryFn: () => ClassroomsAPI.getOne(id || ""),
    enabled: !!id,
    select: (data) => data.data as Classroom,
    staleTime: 1000 * 60 * 20,
  })
}

export function useCreateClassroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClassroomData) => ClassroomsAPI.create(data),
    onSuccess: () => {
      // Invalidate all classrooms queries (including filtered ones)
      // This will trigger a refetch of all active queries
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEY,
        exact: false, // Invalidate all queries starting with CLASSROOMS_KEY
      })

      toast.success("Classroom created successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create classroom")
    },
  })
}

export function useUpdateClassroom(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateClassroomData) => ClassroomsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEY,
        exact: false,
      })
      queryClient.invalidateQueries({ queryKey: [...CLASSROOMS_KEY, id] })
      toast.success("Classroom updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update classroom")
    },
  })
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ClassroomsAPI.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: CLASSROOMS_KEY })
      const previousRaw = queryClient.getQueryData(CLASSROOMS_KEY)

      queryClient.setQueryData(CLASSROOMS_KEY, (old: ClassroomsQueryData | undefined) => {
        if (!old) return old
        if (old.data?.rooms && Array.isArray(old.data.rooms)) {
          return {
            ...old,
            data: {
              ...old.data,
              rooms: old.data.rooms.filter((classroom: Classroom) => classroom.id !== id),
            },
          }
        }
        return old
      })
      return { previous: previousRaw }
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(CLASSROOMS_KEY, ctx.previous)
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete classroom")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEY,
        exact: false,
      })
      toast.success("Classroom deleted successfully")
    },
  })
}

export function useToggleClassroomAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      ClassroomsAPI.update(id, { is_available }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEY,
        exact: false,
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update classroom availability"
      )
    },
  })
}
