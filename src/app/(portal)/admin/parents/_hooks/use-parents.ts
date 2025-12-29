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
import { extractErrorMessage } from "@/lib/error-handler"
import { useParentsStore } from "@/store/parents-store"
import { useEffect } from "react"

// The main list query key
const PARENTS_KEY = ["parents"]

// ----------------------------
// 🔍 GET ALL PARENTS
// ----------------------------
export function useGetParents() {
  const setParents = useParentsStore((state) => state.setParents)
  const setLoading = useParentsStore((state) => state.setLoading)

  const query = useQuery({
    queryKey: PARENTS_KEY,
    queryFn: async () => {
      console.log("useGetParents: Fetching parents from API...")
      setLoading(true)
      try {
        const res = await ParentsAPI.getAll({ limit: 100 } as GetParentsParams)
        // Handle nested response structure: ResponsePack<ResponsePack<User[]>>
        const parents = res?.data?.data || res?.data || []
        console.log("useGetParents: API response:", res)
        console.log("useGetParents: Extracted parents:", parents.length, parents)
        const result = Array.isArray(parents) ? parents : []
        console.log("useGetParents: Returning parents array with length:", result.length)
        return result
      } catch (error) {
        console.error("Failed to fetch parents:", error)
        return []
      } finally {
        setLoading(false)
      }
    },
    staleTime: 0, // Always refetch when invalidated
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    console.log("useGetParents: useEffect triggered", {
      hasData: !!query.data,
      isArray: Array.isArray(query.data),
      dataLength: query.data?.length,
      status: query.status,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    })
    if (query.data && Array.isArray(query.data)) {
      console.log(
        "useGetParents: Syncing query data to store, parent count:",
        query.data.length
      )
      setParents(query.data as User[])
    }
  }, [query.data, setParents, query.status, query.isLoading, query.isFetching])

  return query
}

// ----------------------------
// 🔍 GET PARENT BY ID
// ----------------------------
export function useGetParent(id?: string) {
  const parentFromStore = useParentsStore((state) =>
    id ? state.getParentById(id) : undefined
  )

  return useQuery({
    queryKey: [...PARENTS_KEY, id],
    queryFn: () => ParentsAPI.getOne(id || ""),
    enabled: !!id,
    initialData: parentFromStore
      ? { data: parentFromStore, message: "From store" }
      : undefined,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// ➕ CREATE PARENT
// ----------------------------
export function useCreateParent() {
  const queryClient = useQueryClient()
  const addParent = useParentsStore((state) => state.addParent)

  return useMutation({
    mutationFn: (data: CreateParentData) => ParentsAPI.create(data),
    onSuccess: (newParent) => {
      console.log("Parent created successfully, adding to store:", newParent)
      addParent(newParent)
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      queryClient.refetchQueries({ queryKey: PARENTS_KEY }) // Explicitly refetch
      toast.success("Parent created successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ✏ UPDATE PARENT
// ----------------------------
export function useUpdateParent(id: string) {
  const queryClient = useQueryClient()
  const updateParent = useParentsStore((state) => state.updateParent)

  return useMutation({
    mutationFn: (data: UpdateParentData) => ParentsAPI.update(id, data),
    onSuccess: (updatedParent) => {
      updateParent(id, updatedParent)
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...PARENTS_KEY, id] })
      toast.success("Parent updated successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ❌ DELETE PARENT
// ----------------------------
export function useDeleteParent() {
  const queryClient = useQueryClient()
  const removeParent = useParentsStore((state) => state.removeParent)

  return useMutation({
    mutationFn: (id: string) => ParentsAPI.delete(id),
    onMutate: async (id) => {
      // Optimistic update
      removeParent(id)
      await queryClient.cancelQueries({ queryKey: PARENTS_KEY })
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: PARENTS_KEY })
      const message = extractErrorMessage(error)
      toast.error(message)
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
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
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
