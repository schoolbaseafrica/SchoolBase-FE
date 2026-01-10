"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { InvitesAPI, InviteUserPayload, GetInvitesParams } from "@/lib/invites"

const INVITES_KEY = ["invites"]

export function useInviteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: InviteUserPayload) => InvitesAPI.inviteUser(data),
    onSuccess: () => {
      // Invalidate invites list to refetch
      queryClient.invalidateQueries({ queryKey: INVITES_KEY })
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send invitation")
    },
  })
}

export function useBulkInviteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      InvitesAPI.uploadCsv(file, type),
    onSuccess: () => {
      // Invalidate invites list to refetch
      queryClient.invalidateQueries({ queryKey: INVITES_KEY })
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload CSV")
    },
  })
}

export function useGetInvites(params?: GetInvitesParams) {
  return useQuery({
    queryKey: [...INVITES_KEY, params],
    queryFn: async () => {
      const response = await InvitesAPI.getInvites(params)
      return response.data || []
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}
