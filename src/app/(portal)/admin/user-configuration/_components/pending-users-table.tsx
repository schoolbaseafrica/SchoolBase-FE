"use client"

import { columns, User } from "./columns"
import { DataTable } from "./data-table"
import { useGetInvites } from "../_hooks/use-invite-user"
import { Invite } from "@/lib/invites"

// Map invite data to User type for the table
function mapInviteToUser(invite: Invite, index: number): User {
  return {
    id: invite.id,
    name: invite.full_name || invite.email,
    regNumber: `INV-${index + 1}`,
    role: invite.role === "admin" ? "Admin" : "Teacher",
    status: invite.accepted ? "Accepted" : "Pending",
    date: new Date(invite.invited_at).toLocaleString(),
  }
}

export function PendingUsersTable() {
  const { data: invites = [], isLoading } = useGetInvites({
    status: "pending",
    limit: 100,
    sort_by: "invited_at",
    order: "desc",
  })

  const users: User[] = invites.map((invite, index) => mapInviteToUser(invite, index))

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#2d2d2d] capitalize">
          Pending Invitation
        </h2>
        <p className="text-[#666666]">
          View list of all invites that have not been accepted
        </p>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-[#666666]">Loading invites...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-[#666666]">No pending invites</div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </section>
  )
}
