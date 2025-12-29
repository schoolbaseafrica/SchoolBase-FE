"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Resend invite", user.id)}>
              Resend Invite
            </DropdownMenuItem>
            {user.status === "Pending" && (
              <DropdownMenuItem
                onClick={() => console.log("Cancel invite", user.id)}
                className="text-red-600 focus:text-red-600"
              >
                Cancel Invite
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
