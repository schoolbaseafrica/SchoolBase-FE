"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Classroom } from "@/types/classroom"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface ClassroomCardProps {
  classroom: Classroom
  onEdit: (classroom: Classroom) => void
  onDelete: (classroom: Classroom) => void
  onToggleAvailability: (id: string, is_available: boolean) => void
}

export function ClassroomCard({ classroom, onEdit, onDelete }: ClassroomCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [localAvailability, setLocalAvailability] = useState(classroom.is_available)

  const handleToggleAvailability = () => {
    setLocalAvailability(!localAvailability)
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classroom.name}
                  </h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(classroom)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleAvailability}>
                      Mark as {localAvailability ? "In Use" : "Available"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-end justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{classroom.capacity} Capacity</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Floor {classroom.location}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {classroom.type}
                  </div>
                </div>

                <div className="mt-4">
                  <Badge
                    className={`rounded-lg px-6 py-2 text-xs font-medium text-gray-900 ${
                      localAvailability
                        ? "bg-green-100 text-green-500"
                        : "bg-amber-100 text-amber-500"
                    }`}
                  >
                    {localAvailability ? "Available" : "In Use"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          onDelete(classroom)
          setDeleteDialogOpen(false)
        }}
        title="Delete Classroom"
        description="Are you sure you want to delete this classroom? This action cannot be undone."
        itemName={classroom.name}
      />
    </>
  )
}
