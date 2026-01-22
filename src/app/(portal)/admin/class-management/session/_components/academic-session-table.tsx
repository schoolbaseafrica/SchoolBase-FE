"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, MoreVertical, Power } from "lucide-react"
import SessionDrawer from "./session-drawer"
import { AcademicSession } from "@/lib/academic-session"
import { useActivateAcademicSession } from "../_hooks/use-session"
import { toast } from "sonner"

type Props = {
  sessions: AcademicSession[]
}

const AcademicSessionTable = ({ sessions }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<AcademicSession | null>(null)
  const activateMutation = useActivateAcademicSession()

  // VIEW session in drawer
  const viewSession = (session: AcademicSession) => {
    setSelected(session)
    setDrawerOpen(true)
  }

  // ACTIVATE session
  const handleActivate = async (session: AcademicSession, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    try {
      const result = await activateMutation.mutateAsync(session.id)
      console.log("Activate result:", result) // Debug log
      toast.success(`Session "${session.name}" has been activated successfully.`)
    } catch (error) {
      console.error("Activate error:", error) // Debug log
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate session. Please try again."
      )
    }
  }

  return (
    <>
      <div className="mt-10 hidden rounded-xl border bg-white p-4 shadow-sm lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead className="text-center">Academic Session</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessions.map((item, index) => (
              <TableRow
                key={item.id}
                onClick={() => viewSession(item)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="text-center">{item.name}</TableCell>
                <TableCell className="text-center">
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
                </TableCell>
                <TableCell className="text-center">{item.startDate}</TableCell>
                <TableCell className="text-center">{item.endDate}</TableCell>
                <TableCell className="pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4 cursor-pointer text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={() => viewSession(item)}
                      >
                        <Eye size={16} /> View Details
                      </DropdownMenuItem>

                      {item.status === "Inactive" && (
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={(e) => handleActivate(item, e)}
                          disabled={activateMutation.isPending}
                        >
                          <Power size={16} /> Activate Session
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Drawer for VIEW ONLY */}
      <SessionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={selected}
      />
    </>
  )
}

export default AcademicSessionTable
