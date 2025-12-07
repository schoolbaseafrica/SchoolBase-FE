"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { InvitesAPI, InviteUserPayload } from "@/lib/invites"

export function useInviteUser() {
  return useMutation({
    mutationFn: (data: InviteUserPayload) => InvitesAPI.inviteUser(data),
    onSuccess: () => {
      // toast.success("Invitation sent successfully")
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send invitation")
    },
  })
}

export function useBulkInviteUser() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      InvitesAPI.uploadCsv(file, type),
    onSuccess: () => {
      // toast.success("Bulk invitation processed successfully")
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload CSV")
    },
  })
}
