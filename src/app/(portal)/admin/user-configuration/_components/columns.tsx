"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { InviteActions } from "./invite-actions"

export type User = {
  id: string
  name: string
  regNumber: string
  role: "Admin" | "Teacher"
  status: "Accepted" | "Pending"
  date: string
  avatar?: string
}

export const columns: ColumnDef<User>[] = [
  {
    header: "S/N",
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <span>{user.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "regNumber",
    header: "Reg Number",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          className={`h-[22px] w-[72px] rounded-[16px] px-2 py-[2px] text-center text-xs font-medium mix-blend-multiply ${
            status === "Accepted"
              ? "bg-[#E6F8F3] text-[#10B981]"
              : "w-[63px] bg-[#FEF5E7] text-[#F59E0B]"
          }`}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date and time",
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      return <InviteActions user={row.original} />
    },
  },
]
