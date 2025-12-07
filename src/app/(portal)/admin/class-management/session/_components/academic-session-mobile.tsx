"use client"

import React, { useState } from "react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
// import { Edit, Eye, MoreVertical } from "lucide-react"
import { AcademicSession } from "@/lib/academic-session"
import SessionDrawer from "./session-drawer"
// import { useRouter } from "next/navigation"

type Props = {
  sessions: AcademicSession[]
}

export default function AcademicSessionsMobile({ sessions }: Props) {
  // const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<AcademicSession | null>(null)

  // Opens drawer in view mode
  const viewSession = (session: AcademicSession) => {
    setSelected(session)
    setDrawerOpen(true)
  }

  // Navigate to create/edit page - block archived sessions
  // const editSession = (id: string) => {
  //   router.push(`/admin/class-management/session/create-session?id=${id}`)
  // }

  return (
    <div className="mt-2 space-y-4 p-3 lg:hidden">
      {sessions.map((item) => (
        <div
          key={item.id}
          onClick={() => viewSession(item)}
          className="relative rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-base font-semibold">{item.name}</h3>

            {/* <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical className="text-gray-600" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => viewSession(item)}
                >
                  <Eye size={16} /> View
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={item.status === "Archived"}
                  className="flex items-center gap-2"
                  onClick={() => editSession(item.id)}
                >
                  <Edit size={16} /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>

          <div className="mt-6 space-y-4 text-sm text-[#404040]">
            <p className="flex justify-between">
              <span>Start date:</span>
              <span>{item.startDate}</span>
            </p>

            <p className="flex justify-between">
              <span>End date:</span>
              <span>{item.endDate}</span>
            </p>

            {/* <p className="flex justify-between">
              <span>Date created:</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </p> */}

            <p className="flex items-center gap-2">
              Status:
              <Badge
                className={
                  item.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.status === "Inactive"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-yellow-100 text-yellow-600"
                }
              >
                {item.status}
              </Badge>
            </p>
          </div>
        </div>
      ))}

      {/* Drawer for viewing */}
      <SessionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={selected}
      />
    </div>
  )
}
