"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ParentsAPI,
  CreateParentData,
  UpdateParentData,
  GetParentsParams,
} from "@/lib/parents"
import type { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"

type ResponsePack<T> = {
  data: T
  message: string
}

type ParentsResponse = ResponsePack<ResponsePack<User[]>>

// The main list query key
const PARENTS_KEY = ["parents"]

// ----------------------------
// 🔍 GET ALL PARENTS
// ----------------------------

export function useGetParents(filters?: GetParentsParams) {
  return useQuery({
    queryKey: [...PARENTS_KEY, filters],
    queryFn: () => ParentsAPI.getAll(filters),
    select: (data) => {
      // Handle the actual response structure
      if (Array.isArray(data.data)) {
        return data.data as User[]
      }
      // Fallback for nested structure
      return (data.data?.data || []) as User[]
    },
    staleTime: 1000 * 60 * 20,
    enabled: true,
  })
}
// ----------------------------
// 🔍 GET PARENT BY ID
// ----------------------------

export function useGetParent(id?: string) {
  return useQuery({
    queryKey: [...PARENTS_KEY, id],
    queryFn: () => ParentsAPI.getOne(id || ""),
    enabled: !!id,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 20,
  })
}

// ----------------------------
// ➕ CREATE PARENT
// ----------------------------

export function useCreateParent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateParentData) => ParentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      toast.success("Parent created successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create parent")
    },
  })
}

// ----------------------------
// ✏ UPDATE PARENT
// ----------------------------

export function useUpdateParent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateParentData) => ParentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...PARENTS_KEY, id] })
      toast.success("Parent updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update parent")
    },
  })
}

// ----------------------------
// ❌ DELETE PARENT (Optimistic Update)
// ----------------------------

export function useDeleteParent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ParentsAPI.delete(id),
    // Optimistic update for snappy UI
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: PARENTS_KEY })
      // Get the raw query data (before select transformation)
      const previousRaw = queryClient.getQueryData(PARENTS_KEY)
      // Update the cache with filtered data, maintaining the response structure
      queryClient.setQueryData(PARENTS_KEY, (old: ParentsResponse | undefined) => {
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
        queryClient.setQueryData(PARENTS_KEY, ctx.previous)
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete parent")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      toast.success("Parent deleted successfully")
    },
  })
}

export const useLinkParentToStudents = (parentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentIds: string[]) => ParentsAPI.linkToStudents(parentId, studentIds),
    onSuccess: () => {
      toast.success("Students linked to parent successfully")
      queryClient.invalidateQueries({
        queryKey: ["parent", parentId, "students"],
      })
    },
  })
}

export const useGetLinkedStudents = (parentId: string) => {
  return useQuery({
    queryKey: ["parent", parentId, "students"],
    queryFn: () => ParentsAPI.getLinkedStudents(parentId),
    select: (data) => data.data as User[],
    staleTime: 1000 * 60 * 20,
    enabled: !!parentId,
  })
}
