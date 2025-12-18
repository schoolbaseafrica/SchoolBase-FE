"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit3, Trash2, Link as LinkIcon } from "lucide-react"
import { SnakeUser as User, UserType } from "@/types/user"
import { useRouter } from "next/navigation"
import { useDeleteTeacher } from "@/app/(portal)/admin/teachers/_hooks/use-teachers"
import { useDeleteStudent } from "@/app/(portal)/admin/students/_hooks/use-students"
import { useDeleteParent } from "@/app/(portal)/admin/parents/_hooks/use-parents"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getInitials } from "@/lib/utils"
import { UserDetailsSheet } from "./user-details-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"

interface UsersGridProps {
  users: User[]
  userType: UserType
}

interface Subject {
  id: string
  name: string
}

interface ClassSubjectResponse {
  id: string
  subject: Subject
  class: {
    id: string
    name: string
  }
}

interface PaginatedResponse {
  payload: ClassSubjectResponse[]
  paginationMeta: {
    total: number
    limit: number
    page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

interface ApiResponse {
  status_code: number
  message: string
  data: PaginatedResponse
}

export function UsersGrid({ users, userType }: UsersGridProps) {
  const deleteTeacherMutation = useDeleteTeacher()
  const deleteStudentMutation = useDeleteStudent()
  const deleteParentMutation = useDeleteParent()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const getFullName = (user: User) =>
    user.full_name || `${user.first_name} ${user.last_name}`

  const isTeacher = userType === "teachers"
  const isStudent = userType === "students"
  const isParent = userType === "parents"
  const router = useRouter()

  // Fetch subjects for each teacher (this can be optimized with a bulk endpoint if available)
  const { data: teacherSubjects } = useQuery({
    queryKey: ["all-teacher-subjects"],
    queryFn: async () => {
      if (!isTeacher) return {}

      const subjectsMap: Record<string, Subject[]> = {}

      // For each teacher, fetch their subjects
      // Note: This is inefficient if you have many teachers.
      // Ideally, the backend should provide a bulk endpoint or include subjects in the teacher list
      for (const user of users) {
        try {
          const response = await apiFetch<ApiResponse>(
            `/class-subjects?teacher_id=${user.teacher_id || user.id}`,
            { method: "GET" },
            true
          )

          if (response.data?.payload) {
            // Extract unique subjects
            const uniqueSubjects = Array.from(
              new Map(
                response.data.payload
                  .filter((item) => item.subject)
                  .map((item) => [item.subject.id, item.subject])
              ).values()
            )
            subjectsMap[user.id] = uniqueSubjects
          }
        } catch (error) {
          console.error(`Error fetching subjects for teacher ${user.id}:`, error)
          subjectsMap[user.id] = []
        }
      }

      return subjectsMap
    },
    enabled: isTeacher && users.length > 0,
  })

  const handleViewClick = (user: User) => {
    setSelectedUser(user)
    setSheetOpen(true)
  }

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
    <>
      <div className="grid gap-4">
        {users.map((user) => {
          const userSubjects = teacherSubjects?.[user.id] || []
          const displaySubjects = userSubjects.slice(0, 3) // Show max 3 subjects on card
          const hasMoreSubjects = userSubjects.length > 3

          return (
            <Card
              key={user.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleViewClick(user)}
            >
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
                              ? user.registration_number || user.reg_number || "N/A"
                              : user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="link" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClick(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {isParent && (
                        <DropdownMenuItem onClick={() => handleLinkStudent(user)}>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Link Student
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditClick(user)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
                  {isTeacher && userSubjects.length > 0 && (
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-muted-foreground">Subjects:</span>
                      <div className="flex max-w-[150px] flex-wrap justify-end gap-1">
                        {displaySubjects.map((subject) => (
                          <span
                            key={subject.id}
                            className="rounded bg-gray-100 px-2 py-1 text-xs"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {hasMoreSubjects && (
                          <span className="text-xs text-gray-400">
                            +{userSubjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {isTeacher && userSubjects.length === 0 && (
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-muted-foreground">Subjects:</span>
                      <span className="text-xs text-gray-400">No subjects</span>
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
          )
        })}
      </div>

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

      <UserDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selectedUser}
        userType={userType}
      />
    </>
  )
}
