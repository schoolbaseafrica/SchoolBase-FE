"use client"

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useResendInvite, useDeleteInvite } from "../_hooks/use-invite-user"
import { User } from "./columns"

interface InviteActionsProps {
  user: User
}

export function InviteActions({ user }: InviteActionsProps) {
  const resendInvite = useResendInvite()
  const deleteInvite = useDeleteInvite()

  const handleResend = () => {
    if (confirm(`Resend invitation email to ${user.name}?`)) {
      resendInvite.mutate(user.id)
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete invitation for ${user.name}? This action cannot be undone.`)) {
      deleteInvite.mutate(user.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleResend}
          disabled={resendInvite.isPending}
        >
          {resendInvite.isPending ? "Resending..." : "Resend Invite"}
        </DropdownMenuItem>
        {user.status === "Pending" && (
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={deleteInvite.isPending}
            className="text-red-600 focus:text-red-600"
          >
            {deleteInvite.isPending ? "Deleting..." : "Cancel Invite"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
