"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { SnakeUser as User, UserType } from "@/types/user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeleteTeacher } from "@/app/(portal)/admin/teachers/_hooks/use-teachers"
import { useDeleteStudent } from "@/app/(portal)/admin/students/_hooks/use-students"
import { useDeleteParent } from "@/app/(portal)/admin/parents/_hooks/use-parents"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getInitials } from "@/lib/utils"

interface UsersGridProps {
  users: User[]
  userType: UserType
}

export function UsersGrid({ users, userType }: UsersGridProps) {
  const deleteTeacherMutation = useDeleteTeacher()
  const deleteStudentMutation = useDeleteStudent()
  const deleteParentMutation = useDeleteParent()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const getFullName = (user: User) =>
    user.full_name || `${user.first_name} ${user.last_name}`

  const isTeacher = userType === "teachers"
  const isStudent = userType === "students"
  const isParent = userType === "parents"
  const router = useRouter()

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    if (isTeacher) {
      await deleteTeacherMutation.mutateAsync(userToDelete.id)
    } else if (isStudent) {
      await deleteStudentMutation.mutateAsync(userToDelete.id)
    } else if (isParent) {
      await deleteParentMutation.mutateAsync(userToDelete.id)
    }
  }

  const handleEditClick = (user: User) => {
    if (isTeacher) {
      router.push(`/admin/teachers/${user.id}`)
    } else if (isStudent) {
      router.push(`/admin/students/${user.id}`)
    } else if (isParent) {
      router.push(`/admin/parents/${user.id}`)
    }
  }

  const handleLinkStudent = (user: User) => {
    // Implement link student functionality
    router.push(`/admin/parents/${user.id}/link`)
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={getFullName(user)} />
                  <AvatarFallback>
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{getFullName(user)}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">
                      {isTeacher
                        ? user.employment_id
                        : isStudent
                          ? user.registration_number || user.reg_number || "N/A" // Check both
                          : user.role}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isParent && (
                    <DropdownMenuItem onClick={() => handleLinkStudent(user)}>
                      Link Student
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleEditClick(user)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(user)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              {isParent && (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-muted-foreground">Relationship:</p>
                    <p className="text-right font-medium">{user.role}</p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-muted-foreground">Email:</p>
                    <p className="text-right font-medium">{user.email}</p>
                  </div>
                </>
              )}
              {isStudent && (
                <>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-muted-foreground">Class:</p>
                    <p className="text-right font-medium">{user.class}</p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-muted-foreground">Guardian:</p>
                    <p className="text-right font-medium">{user.guardian}</p>
                  </div>
                </>
              )}
              {isTeacher && (
                <div className="flex items-center justify-between pb-2">
                  <span className="text-muted-foreground">Subject:</span>
                  <p>{user.role}</p>
                </div>
              )}
              <div className="flex items-center justify-between pb-2">
                <p className="text-muted-foreground">Phone No:</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              {isParent && (
                <div className="flex items-center justify-between pb-2">
                  <p className="text-muted-foreground">Address:</p>
                  <p className="text-right text-xs">{user.home_address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {userToDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title={
            isTeacher ? "Delete Teacher" : isStudent ? "Delete Student" : "Delete Parent"
          }
          description={
            isTeacher
              ? "Are you sure you want to delete this teacher? This action cannot be undone."
              : isStudent
                ? "Are you sure you want to delete this student? This action cannot be undone."
                : "Are you sure you want to delete this parent? This action cannot be undone."
          }
          itemName={getFullName(userToDelete)}
        />
      )}
    </div>
  )
}
