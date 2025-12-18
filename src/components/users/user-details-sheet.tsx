"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, Link as LinkIcon, Loader2 } from "lucide-react"
import { SnakeUser as User, UserType } from "@/types/user"
import { useRouter } from "next/navigation"
import { useDeleteTeacher } from "@/app/(portal)/admin/teachers/_hooks/use-teachers"
import { useDeleteStudent } from "@/app/(portal)/admin/students/_hooks/use-students"
import { useDeleteParent } from "@/app/(portal)/admin/parents/_hooks/use-parents"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getInitials } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { useAuthUser } from "@/hooks/use-auth-user"

interface UserDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  userType: UserType
}

interface Subject {
  id: string
  name: string
  code?: string
  description?: string
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

interface LinkedStudent {
  id: string
  first_name: string
  last_name: string
  registration_number?: string
  class?: string
}

export function UserDetailsSheet({
  open,
  onOpenChange,
  user,
  userType,
}: UserDetailsSheetProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: authUser } = useAuthUser()

  // Fetch subjects for teachers
  const { data: subjectsResponse, isLoading: loadingSubjects } = useQuery({
    queryKey: ["teacher-subjects", user?.id],
    queryFn: async () => {
      if (userType !== "teachers" || !user) return null

      // First get teacher ID from auth user if needed
      let teacherId = user.teacher_id || user.id

      // If we don't have teacher_id in the user object, try to get it from auth/me
      if (!teacherId && authUser?.teacher_id) {
        teacherId = authUser.teacher_id
      }

      if (!teacherId) return null

      try {
        const response = await apiFetch<ApiResponse>(
          `/class-subjects?teacher_id=${teacherId}`,
          { method: "GET" },
          true
        )
        return response.data || null
      } catch (error) {
        console.error("Error fetching subjects:", error)
        return null
      }
    },
    enabled: open && userType === "teachers" && !!user,
  })

  // Extract unique subjects from the response
  const subjects = subjectsResponse?.payload
    ? Array.from(
        new Map(
          subjectsResponse.payload
            .filter((item) => item.subject)
            .map((item) => [item.subject.id, item.subject])
        ).values()
      )
    : []

  // Fetch linked students for parents
  const { data: linkedStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ["parent-linked-students", user?.id],
    queryFn: async () => {
      if (userType !== "parents" || !user) return []

      try {
        const response = await apiFetch<{ data: LinkedStudent[] }>(
          `/parents/admin/${user.id}/students`,
          { method: "GET" },
          true
        )
        return response.data || []
      } catch (error) {
        console.error("Error fetching linked students:", error)
        return []
      }
    },
    enabled: open && userType === "parents" && !!user,
  })

  const deleteTeacherMutation = useDeleteTeacher()
  const deleteStudentMutation = useDeleteStudent()
  const deleteParentMutation = useDeleteParent()

  if (!user) return null

  const getFullName = () => user.full_name || `${user.first_name} ${user.last_name}`

  const getID = () => {
    return user.employment_id || user.registration_number || user.reg_number || "N/A"
  }

  const handleDelete = async () => {
    if (!user) return

    try {
      if (userType === "teachers") {
        await deleteTeacherMutation.mutateAsync(user.id)
      } else if (userType === "students") {
        await deleteStudentMutation.mutateAsync(user.id)
      } else if (userType === "parents") {
        await deleteParentMutation.mutateAsync(user.id)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/${userType}/${user.id}`)
    onOpenChange(false)
  }

  const handleLinkStudent = () => {
    if (userType === "parents") {
      router.push(`/admin/parents/${user.id}/link`)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto p-8 sm:max-w-lg">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="text-xl">
              {userType === "teachers"
                ? "Teacher"
                : userType === "students"
                  ? "Student"
                  : "Parent"}{" "}
              Details
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={getFullName()} />
                <AvatarFallback>
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{getFullName()}</h3>
                <p className="text-sm text-gray-600">
                  {userType === "teachers"
                    ? "Employee ID"
                    : userType === "students"
                      ? "Registration No"
                      : "Parent ID"}
                  : {getID()}
                </p>
                <Badge variant={user.is_active ? "default" : "inactive"} className="mt-1">
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{user.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(user.date_of_birth).toLocaleDateString("en-CA")}
                  </p>
                </div>
              </div>

              {user.home_address && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{user.home_address}</p>
                </div>
              )}

              {/* Additional Info based on user type */}
              {userType === "students" && user.class && (
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium">{user.class}</p>
                </div>
              )}

              {userType === "parents" && user.role && (
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              )}

              {/* Subjects for Teachers */}
              {userType === "teachers" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Subjects Assigned</p>
                    {loadingSubjects && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  {loadingSubjects ? (
                    <p className="text-sm text-gray-500">Loading subjects...</p>
                  ) : subjects && subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <Badge key={subject.id} variant="outline">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subjects assigned</p>
                  )}
                </div>
              )}

              {/* Linked Students for Parents */}
              {userType === "parents" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Linked Students</p>
                    {loadingStudents && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  {loadingStudents ? (
                    <p className="text-sm text-gray-500">Loading students...</p>
                  ) : linkedStudents && linkedStudents.length > 0 ? (
                    <div className="space-y-2">
                      {linkedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.last_name}
                            </p>
                            {student.registration_number && (
                              <p className="text-sm text-gray-600">
                                {student.registration_number}
                              </p>
                            )}
                          </div>
                          {student.class && (
                            <Badge variant="outline">{student.class}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No students linked</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              {userType === "parents" && (
                <Button
                  onClick={handleLinkStudent}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Student to Parent
                </Button>
              )}
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full justify-start"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                className="mt-2 w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={
          userType === "teachers"
            ? "Delete Teacher"
            : userType === "students"
              ? "Delete Student"
              : "Delete Parent"
        }
        description={
          userType === "teachers"
            ? "Are you sure you want to delete this teacher? This action cannot be undone."
            : userType === "students"
              ? "Are you sure you want to delete this student? This action cannot be undone."
              : "Are you sure you want to delete this parent? This action cannot be undone."
        }
        itemName={getFullName()}
      />
    </>
  )
}
