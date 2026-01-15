"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AdminsAPI,
  CreateAdminData,
  UpdateAdminData,
} from "@/lib/admins"
import type { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"
import { extractErrorMessage } from "@/lib/error-handler"
import { useAdminsStore } from "@/store/admins-store"
import { useEffect } from "react"

// The main list query key
const ADMINS_KEY = ["admins"]

// ----------------------------
// 🔍 GET ALL ADMINS
// ----------------------------
export function useGetAdmins() {
  const setAdmins = useAdminsStore((state) => state.setAdmins)
  const setLoading = useAdminsStore((state) => state.setLoading)
  const filters = useAdminsStore(
    useShallow((state) => ({
      isActive: state.filters.isActive,
      search: state.filters.search,
    }))
  )

  const query = useQuery({
    // Include is_active filter in queryKey so it refetches when filter changes
    queryKey: [...ADMINS_KEY, "all", { is_active: filters.isActive, search: filters.search }],
    queryFn: async () => {
      setLoading(true)
      try {
        // Pass the is_active filter to the backend API
        const res = await AdminsAPI.getAll({ 
          limit: 100,
          is_active: filters.isActive,
          search: filters.search || undefined,
        })
        let admins: User[] = []
        const resData = res?.data as unknown
        if (Array.isArray(resData)) {
          admins = resData
        } else if (resData && typeof resData === "object" && "data" in resData) {
          const nestedData = (resData as { data: unknown }).data
          if (Array.isArray(nestedData)) {
            admins = nestedData
          } else if (
            nestedData &&
            typeof nestedData === "object" &&
            "data" in nestedData
          ) {
            const doubleNested = (nestedData as { data: unknown }).data
            if (Array.isArray(doubleNested)) {
              admins = doubleNested
            }
          }
        }
        const result = Array.isArray(admins) ? admins : []
        return result
      } catch (error) {
        console.error("Failed to fetch admins:", error)
        return []
      } finally {
        setLoading(false)
      }
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setAdmins(query.data)
    }
  }, [query.data, query.status, query.isLoading, query.isError, setAdmins])

  return query
}

// ----------------------------
// 🔍 GET ADMIN BY ID
// ----------------------------
export function useGetAdmin(id?: string) {
  const adminFromStore = useAdminsStore((state) =>
    id ? state.getAdminById(id) : undefined
  )

  return useQuery({
    queryKey: [...ADMINS_KEY, id],
    queryFn: () => AdminsAPI.getOne(id || ""),
    enabled: !!id,
    initialData: adminFromStore
      ? { data: adminFromStore, message: "From store" }
      : undefined,
    select: (data) => data.data as User,
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------
// ➕ CREATE ADMIN
// ----------------------------
export function useCreateAdmin() {
  const queryClient = useQueryClient()
  const addAdmin = useAdminsStore((state) => state.addAdmin)

  return useMutation({
    mutationFn: (data: CreateAdminData) => AdminsAPI.create(data),
    onSuccess: async (newAdmin) => {
      addAdmin(newAdmin)
      await queryClient.invalidateQueries({
        queryKey: ADMINS_KEY,
        refetchType: "active",
      })
      await queryClient.refetchQueries({ queryKey: ADMINS_KEY, type: "active" })
      toast.success("Admin created successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ✏ UPDATE ADMIN
// ----------------------------
export function useUpdateAdmin(id: string) {
  const queryClient = useQueryClient()
  const updateAdmin = useAdminsStore((state) => state.updateAdmin)

  return useMutation({
    mutationFn: (data: UpdateAdminData) => AdminsAPI.update(id, data),
    onSuccess: (updatedAdmin) => {
      updateAdmin(id, updatedAdmin)
      queryClient.invalidateQueries({ queryKey: ADMINS_KEY })
      queryClient.invalidateQueries({ queryKey: [...ADMINS_KEY, id] })
      toast.success("Admin updated successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}

// ----------------------------
// ❌ DELETE ADMIN
// ----------------------------
export function useDeleteAdmin() {
  const queryClient = useQueryClient()
  const removeAdmin = useAdminsStore((state) => state.removeAdmin)

  return useMutation({
    mutationFn: (id: string) => AdminsAPI.delete(id),
    onMutate: async (id) => {
      removeAdmin(id)
      await queryClient.cancelQueries({ queryKey: ADMINS_KEY })
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ADMINS_KEY })
      const message = extractErrorMessage(error)
      toast.error(message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMINS_KEY })
      toast.success("Admin deleted successfully")
    },
  })
}
