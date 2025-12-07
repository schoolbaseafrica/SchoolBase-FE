"use client"

import { columns, User } from "./columns"
import { DataTable } from "./data-table"

const mockData: User[] = []

export function InvitedUsersTable() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[#2d2d2d] capitalize">View Invitations</h2>
        <p className="text-[#666666]">View list of all invited users to the portal</p>
      </div>
      <DataTable columns={columns} data={mockData} />
    </section>
  )
}
