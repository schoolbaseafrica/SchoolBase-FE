"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SuperAdminAPI, CreateAdminData } from "@/lib/api/superadmin"

export function useCreateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAdminData) => SuperAdminAPI.createAdmin(data),
    onSuccess: () => {
      // Invalidate any admin-related queries if they exist
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
  })
}

