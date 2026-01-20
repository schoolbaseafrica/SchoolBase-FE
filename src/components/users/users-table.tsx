"use client"

import { useState, useEffect } from "react"
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
import { LinkIcon, Eye } from "lucide-react"
import { SnakeUser as User, UserType } from "@/types/user"
import { useRouter } from "next/navigation"
import { useDeleteTeacher } from "@/app/(portal)/admin/teachers/_hooks/use-teachers"
import { useDeleteStudent } from "@/app/(portal)/admin/students/_hooks/use-students"
import { useDeleteParent } from "@/app/(portal)/admin/parents/_hooks/use-parents"
import { useDeleteAdmin } from "@/app/(portal)/admin/admins/_hooks/use-admins"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getInitials } from "@/lib/utils"
import { UserDetailsSheet } from "./user-details-sheet"
import { Button } from "@/components/ui/button"
import { ClassesAPI } from "@/lib/classes"

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
  const deleteAdminMutation = useDeleteAdmin()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [
    userToDelete,
    // setUserToDelete
  ] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const getFullName = (user: User) =>
    user.full_name || `${user.first_name} ${user.last_name}`

  const getID = (user: User) => {
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
  const isAdmin = userType === "admins"
  const router = useRouter()

  // Fetch class assignments for all teachers
  const [teacherClassesMap, setTeacherClassesMap] = useState<Record<string, string[]>>({})
  
  useEffect(() => {
    if (isTeacher && users.length > 0) {
      // Fetch classes for all teachers in parallel
      Promise.all(
        users.map(async (teacher) => {
          try {
            const response = await ClassesAPI.getClassesByTeacher(teacher.teacher_id || teacher.id)
            // Response structure: ResponsePack<{ id: string; name: string; arm?: string; ... }[]>
            // So response.data is the array directly
            const classes = response.data || []
            return {
              teacherId: teacher.teacher_id || teacher.id,
              classNames: classes.map((cls) => `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}`),
            }
          } catch (error) {
            console.error(`Error fetching classes for teacher ${teacher.id}:`, error)
            return { teacherId: teacher.teacher_id || teacher.id, classNames: [] }
          }
        })
      ).then((results) => {
        const map: Record<string, string[]> = {}
        results.forEach(({ teacherId, classNames }) => {
          map[teacherId] = classNames
        })
        setTeacherClassesMap(map)
      })
    }
  }, [isTeacher, users])

  const handleViewClick = (user: User) => {
    setSelectedUser(user)
    setSheetOpen(true)
  }

  const getTeacherClasses = (teacher: User): string => {
    const teacherId = teacher.teacher_id || teacher.id
    const classes = teacherClassesMap[teacherId] || []
    if (classes.length === 0) {
      return "Not assigned"
    }
    return classes.join(", ")
  }

  // const handleDeleteClick = (user: User, e?: React.MouseEvent) => {
  //   if (e) e.stopPropagation()
  //   setUserToDelete(user)
  //   setDeleteDialogOpen(true)
  // }

  // const handleEditClick = (user: User, e?: React.MouseEvent) => {
  //   if (e) e.stopPropagation()
  //   if (isTeacher) {
  //     router.push(`/admin/teachers/${user.id}`)
  //   } else if (isStudent) {
  //     router.push(`/admin/students/${user.id}`)
  //   } else if (isParent) {
  //     router.push(`/admin/parents/${user.id}`)
  //   }
  // }

  const handleLinkStudent = (user: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (isParent) {
      router.push(`/admin/parents/${user.id}/link`)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    if (isTeacher) {
      await deleteTeacherMutation.mutateAsync(userToDelete.id)
    } else if (isStudent) {
      await deleteStudentMutation.mutateAsync(userToDelete.id)
    } else if (isParent) {
      await deleteParentMutation.mutateAsync(userToDelete.id)
    } else if (isAdmin) {
      await deleteAdminMutation.mutateAsync(userToDelete.id)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S/N</TableHead>
            <TableHead>
              {isTeacher ? "Teacher" : isStudent ? "Student" : isAdmin ? "Admin" : "Parent"}
            </TableHead>
            {isParent && <TableHead>Email</TableHead>}
            {isParent && <TableHead>Address</TableHead>}
            {!isParent && !isAdmin && (
              <TableHead>
                {isTeacher ? "Employee Number" : "Registration Number"}
              </TableHead>
            )}
            {isTeacher && <TableHead>Email</TableHead>}
            {isTeacher && <TableHead>Classes</TableHead>}
            {isAdmin && <TableHead>Email</TableHead>}
            {isStudent && <TableHead>Class</TableHead>}
            {isStudent && <TableHead>Address</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleViewClick(user)}
            >
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.home_address}</TableCell>
                </>
              )}
              {!isParent && !isAdmin && <TableCell>{getID(user)}</TableCell>}
              {isTeacher && <TableCell>{user.email}</TableCell>}
              {isTeacher && (
                <TableCell className="max-w-xs">
                  <div className="truncate">{getTeacherClasses(user)}</div>
                </TableCell>
              )}
              {isAdmin && <TableCell>{user.email}</TableCell>}
              {isStudent && (
                <>
                  <TableCell>
                    {user.class || <span className="text-muted-foreground">Not assigned</span>}
                  </TableCell>
                  <TableCell>{user.home_address}</TableCell>
                </>
              )}
              <TableCell>
                <Badge variant={getStatusVariant(user.is_active)}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                    onClick={() => handleViewClick(user)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isParent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                      onClick={(e) => handleLinkStudent(user, e)}
                      title="Link student"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                    onClick={(e) => handleEditClick(user, e)}
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteClick(user, e)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
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
            isTeacher ? "Delete Teacher" : isStudent ? "Delete Student" : isAdmin ? "Delete Admin" : "Delete Parent"
          }
          description={
            isTeacher
              ? "Are you sure you want to delete this teacher? This action cannot be undone."
              : isStudent
                ? "Are you sure you want to delete this student? This action cannot be undone."
                : isAdmin
                  ? "Are you sure you want to delete this admin? This action cannot be undone."
                  : "Are you sure you want to delete this parent? This action cannot be undone."
          }
          itemName={getFullName(userToDelete)}
        />
      )}

      <UserDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selectedUser}
        userType={userType}
      />
    </div>
  )
}
