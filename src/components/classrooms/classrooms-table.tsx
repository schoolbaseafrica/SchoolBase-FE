"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Classroom } from "@/types/classroom"
import { titleCase } from "@/lib/utils"
import { useState } from "react"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface ClassroomsTableProps {
  classrooms: Classroom[]
  onEdit: (classroom: Classroom) => void
  onDelete: (classroom: Classroom) => void
  onToggleAvailability: (id: string, is_available: boolean) => void
}

export function ClassroomsTable({
  classrooms,
  onEdit,
  onDelete,
  onToggleAvailability,
}: ClassroomsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null)

  const handleDeleteClick = (classroom: Classroom) => {
    setClassroomToDelete(classroom)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (classroomToDelete) {
      onDelete(classroomToDelete)
      setDeleteDialogOpen(false)
      setClassroomToDelete(null)
    }
  }

  const handleToggleAvailability = async (classroom: Classroom) => {
    const newAvailability = !(classroom.is_available !== undefined ? classroom.is_available : true)
    await onToggleAvailability(classroom.id, newAvailability)
  }

  if (classrooms.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No rooms found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((classroom) => {
              const isAvailable = classroom.is_available !== undefined ? classroom.is_available : true
              return (
                <TableRow key={classroom.id}>
                  <TableCell className="font-medium">
                    {titleCase(classroom.name)}
                  </TableCell>
                  <TableCell>
                    {classroom.type
                      ? classroom.type
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : "-"}
                  </TableCell>
                  <TableCell>{classroom.capacity}</TableCell>
                  <TableCell>Floor {classroom.location}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isAvailable ? "Available" : "In Use"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(classroom)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleAvailability(classroom)}>
                          Mark as {isAvailable ? "In Use" : "Available"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(classroom)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        description="Are you sure you want to delete this room? This action cannot be undone."
        itemName={classroomToDelete ? titleCase(classroomToDelete.name) : ""}
      />
    </>
  )
}
