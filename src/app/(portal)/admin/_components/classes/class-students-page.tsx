"use client"

import {
  ArrowLeftIcon,
  BookOpenIcon,
  CircleSlash2Icon,
  UserPlusIcon,
  MoreVertical,
} from "lucide-react"

import { useParams } from "next/navigation"
import { ItemsError } from "../loading-error"
import EmptyState from "../empty-state"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  useGetClass,
  useGetClassStudents,
  useRemoveStudentFromClass,
} from "../../class-management/_hooks/use-classes"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { UnassignStudentConfirmationDialog } from "./unassign-student-confirmation-dialog"

import { ItemLoader } from "../sub-loader"
import { StudentsForClass } from "@/lib/classes"

export default function ViewClassStudents() {
  const { classID } = useParams<{ classID: string }>()
  const [openUnassignDialog, setOpenUnassignDialog] = useState<
    StudentsForClass | boolean
  >(false)

  const {
    data: classData,
    isLoading: isLoadingClass,
    isError: isErrorClass,
    error: errorClass,
    refetch: refetchClass,
  } = useGetClass(classID)

  const {
    data: students,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGetClassStudents(classID)

  const unAssignMutation = useRemoveStudentFromClass(classID)

  const isLoading = isLoadingClass || isLoadingStudents
  const isError = isErrorClass || isErrorStudents
  const error = errorClass || errorStudents

  return (
    <div>
      <section className="lg:mx-5">
        <div className="flex items-start gap-5">
          <Button asChild className="bg-gray-100" variant="ghost" size="icon">
            <Link
              href="/admin/class-management/class"
              aria-label="Go back to classes"
              className="flex"
            >
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>

          <div className="flex grow flex-col items-start justify-between space-y-3 md:flex-row">
            <DashboardTitle
              heading="Class Students"
              description="View the students assigned to this class"
            />
            <div className="flex flex-col items-stretch gap-2">
              <Button asChild className="h-10 w-full gap-2 md:w-auto">
                <Link href={`/admin/class-management/class/${classID}/students/assign`}>
                  <UserPlusIcon className="h-4 w-4" />
                  Assign Students
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 w-full gap-2 md:w-auto">
                <Link href={`/admin/class-management/class/${classID}/subjects`}>
                  <BookOpenIcon className="h-4 w-4" />
                  View Subjects
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <ItemLoader item="Class students" />
          </div>
        ) : isError ? (
          <ItemsError
            item="Class students"
            reload={() => {
              if (isErrorClass) {
                refetchClass()
              }
              if (isErrorStudents) {
                refetchStudents()
              }
            }}
            errorMessage={error?.message || "An unexpected error occurred."}
          />
        ) : !classData ? (
          <ItemsError item="Class" reload={refetchClass} errorMessage="Class not found" />
        ) : (
          <div>
            {/* Session and Class Info */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {classData.academicSession.name} Academic Session
              </p>
            </div>

            {/* Students Label */}
            <h3 className="text-sm font-medium text-gray-700">
              Students for {classData.name}
            </h3>

            {!students || students.length === 0 ? (
              <EmptyState
                title="No Students Assigned"
                description="This class has no students assigned yet."
                buttonText="Assign Students"
                buttonHref={`/admin/class-management/class/${classID}/students/assign`}
              />
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {students.map((student) => (
                  <StudentCard
                    key={student.student_id}
                    student={student}
                    onRemoveStudent={() => handleConfirmRemove(student)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <UnassignStudentConfirmationDialog
        open={!!openUnassignDialog}
        onOpenChange={setOpenUnassignDialog}
        className={classData?.name || ""}
        onConfirm={async () => {
          if (openUnassignDialog && typeof openUnassignDialog !== "boolean") {
            await handleRemoveStudent(openUnassignDialog)
          }
        }}
      />
    </div>
  )

  async function handleConfirmRemove(student: StudentsForClass) {
    if (!student?.student_id) {
      toast.error("Cannot unassign invalid student from the class.")
      return
    }
    setOpenUnassignDialog(student)
  }

  async function handleRemoveStudent(student: StudentsForClass) {
    try {
      await unAssignMutation.mutateAsync(student.student_id)
    } catch (error) {
      // The hook's onError will show a toast, but we can log here for debugging.
      console.error("Failed to unassign student", error)
    }
  }
}

function StudentCard({
  student,
  onRemoveStudent,
}: {
  student: StudentsForClass
  onRemoveStudent: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Student Info */}
      <div className="flex-1">
        <h4 className="text-base font-semibold text-gray-900">{student.name}</h4>
        <p className="text-sm text-gray-600">{student.registration_number}</p>
      </div>

      {/* Remove Button */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onRemoveStudent()
            }}
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <CircleSlash2Icon className="mr-2 h-4 w-4" />
            Remove from Class
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
