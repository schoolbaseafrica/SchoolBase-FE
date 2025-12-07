"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, LinkIcon } from "lucide-react"
import { SnakeUser as User, UserType } from "@/types/user"
import { useRouter } from "next/navigation"
import { useDeleteTeacher } from "@/app/(portal)/admin/teachers/_hooks/use-teachers"
import { useDeleteStudent } from "@/app/(portal)/admin/students/_hooks/use-students"
import { useDeleteParent } from "@/app/(portal)/admin/parents/_hooks/use-parents"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getInitials } from "@/lib/utils"

interface UsersTableProps {
  users: User[]
  userType: UserType
  currentPage: number
  itemsPerPage: number
}

export function UsersTable({
  users,
  userType,
  currentPage,
  itemsPerPage,
}: UsersTableProps) {
  const deleteTeacherMutation = useDeleteTeacher()
  const deleteStudentMutation = useDeleteStudent()
  const deleteParentMutation = useDeleteParent()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const getFullName = (user: User) =>
    user.full_name || `${user.first_name} ${user.last_name}`

  const getID = (user: User) => {
    // Check both possible field names
    return user.employment_id || user.registration_number || user.reg_number || "N/A"
  }

  const startSN = (currentPage - 1) * itemsPerPage + 1
  const getStatusVariant = (isActive: boolean) => {
    if (isActive) return "default"
    return "inactive"
  }

  const isTeacher = userType === "teachers"
  const isStudent = userType === "students"
  const isParent = userType === "parents"
  const router = useRouter()

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S/N</TableHead>
            <TableHead>
              {isTeacher ? "Teacher" : isStudent ? "Student" : "Parent"}
            </TableHead>
            {/* {isParent && <TableHead>Relationship</TableHead>} */}
            {isParent && <TableHead>Email</TableHead>}
            {isParent && <TableHead>Address</TableHead>}
            {!isParent && (
              <TableHead>
                {isTeacher ? "Employee Number" : "Registration Number"}
              </TableHead>
            )}
            {isTeacher && <TableHead>Email</TableHead>}
            {/* {isStudent && <TableHead>Class</TableHead>} */}
            {isStudent && <TableHead>Address</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{startSN + index}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={getFullName(user)} />
                    <AvatarFallback>
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{getFullName(user)}</span>
                </div>
              </TableCell>
              {isParent && (
                <>
                  {/* <TableCell>{user.role}</TableCell> */}
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.home_address}</TableCell>
                </>
              )}
              {!isParent && <TableCell>{getID(user)}</TableCell>}
              {isTeacher && <TableCell>{user.email}</TableCell>}
              {isStudent && (
                <>
                  {/* <TableCell>{user.class}</TableCell> */}
                  <TableCell>{user.home_address}</TableCell>
                </>
              )}
              <TableCell>
                <Badge variant={getStatusVariant(user.is_active)}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-[#da3743]">
                  {isParent && (
                    <LinkIcon
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => handleLinkStudent(user)}
                    />
                  )}
                  <Trash2
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleDeleteClick(user)}
                  />
                  <Edit3
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleEditClick(user)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
