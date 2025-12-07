"use client"

import {
  ArrowLeftIcon,
  CircleSlash2Icon,
  MoreVerticalIcon,
  UserPlusIcon,
} from "lucide-react"
import { useParams } from "next/navigation"
import { SubjectsLoadingSkeleton } from "./subjects-loading-skeleton"
import { ItemsError } from "../loading-error"
import EmptyState from "../empty-state"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  useGetClass,
  useGetSubjectsForClass,
  useUnassignTeachersToClassSubject,
} from "../../class-management/_hooks/use-classes"
import { ClassSubject } from "@/lib/classes"
import { useGetTeacher } from "../../teachers/_hooks/use-teachers"
import AssignSubjectsDialog from "./assign-subject-to-class-dialog"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AssignTeacherDialog from "./assign-teacher-class-subject-dialog"
import { toast } from "sonner"
import { UnassignConfirmationDialog } from "./unassign-teacher-confirmation-dialog"

export default function ViewClassSubjects() {
  const { classID } = useParams<{ classID: string }>()
  const [showDialog, setShowDialog] = useState(false)
  const [assignTeacherSubject, setAssignTeacher] = useState<ClassSubject | null>(null)
  const [openUnassignDialog, setOpenUnassignDialog] = useState<ClassSubject | boolean>(
    false
  )

  const {
    data: classData,
    isLoading: isLoadingClass,
    isError: isErrorClass,
    error: errorClass,
    refetch: refetchClass,
  } = useGetClass(classID)

  const {
    data: subjectsInfo,
    isLoading: isLoadingSubjects,
    isError: isErrorSubjects,
    error: errorSubjects,
    refetch: refetchSubjects,
  } = useGetSubjectsForClass(classID)
  const subjects = subjectsInfo && subjectsInfo.payload

  const unAssignMutation = useUnassignTeachersToClassSubject()

  const isLoading = isLoadingClass || isLoadingSubjects
  const isError = isErrorClass || isErrorSubjects
  const error = errorClass || errorSubjects

  return (
    <div>
      <Button asChild className="bg-gray-100" variant="ghost" size="icon">
        <Link
          href={`/admin/class-management/class/${classID}`}
          aria-label="Go back to classes"
          className="flex"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
      </Button>

      <section className="mt-5 lg:mx-5">
        <div className="flex flex-col items-start justify-between space-y-3 md:flex-row">
          <DashboardTitle
            heading="Class Subjects"
            description="View the subjects assigned to this class"
          />
          <Button
            className="h-10 w-full md:w-auto"
            disabled={!classData}
            onClick={() => setShowDialog(true)}
          >
            Assign Subjects
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SubjectsLoadingSkeleton />
          </div>
        ) : isError ? (
          <ItemsError
            item="Class subjects"
            reload={() => {
              if (isErrorClass) {
                refetchClass()
              }
              if (isErrorSubjects) {
                refetchSubjects()
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

            {/* Subjects Label */}
            <h3 className="text-sm font-medium text-gray-700">
              Subjects for {classData.name}
            </h3>

            {!subjects || subjects.length === 0 ? (
              <EmptyState
                title="No Subjects Assigned"
                description="This class has no subjects assigned yet."
                buttonText="Assign Subjects"
                buttonHref={`/admin/class-management/class/${classID}/assign-subjects`}
                buttonOnClick={() => setShowDialog(true)}
              />
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onToggleAssignTeacher={(bool: boolean) =>
                      handleToggleAssignTeacher(bool, subject)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <AssignSubjectsDialog
        open={showDialog}
        setOpen={setShowDialog}
        classId={classID}
        className={classData?.name || ""}
      />

      <UnassignConfirmationDialog
        open={!!openUnassignDialog}
        onOpenChange={setOpenUnassignDialog}
        subjectName={
          openUnassignDialog && typeof openUnassignDialog !== "boolean"
            ? openUnassignDialog.subject.name
            : ""
        }
        onConfirm={async () => {
          if (openUnassignDialog && typeof openUnassignDialog !== "boolean") {
            await handleUnassignTeacher(openUnassignDialog)
          }
        }}
      />

      <AssignTeacherDialog
        open={!!assignTeacherSubject}
        setOpen={() => setAssignTeacher(null)}
        classSubjectId={assignTeacherSubject?.id || ""}
        subjectName={assignTeacherSubject?.subject.name || ""}
        className={classData?.name || ""}
      />
    </div>
  )

  async function handleToggleAssignTeacher(bool: boolean, subject: ClassSubject) {
    if (bool) {
      if (!subject?.id) {
        toast.error("Cannot unassign teacher from an invalid subject.")
        return
      }
      setOpenUnassignDialog(subject)
    } else {
      setAssignTeacher(subject)
    }
  }

  async function handleUnassignTeacher(subject: ClassSubject) {
    try {
      await unAssignMutation.mutateAsync(subject.id)
    } catch (error) {
      // The hook's onError will show a toast, but we can log here for debugging.
      console.error("Failed to unassign teacher", error)
    }
  }
}

function SubjectCard({
  subject,
  onToggleAssignTeacher,
}: {
  subject: ClassSubject
  onToggleAssignTeacher: (bool: boolean) => void
}) {
  const { data: teacher } = useGetTeacher(subject.teacher?.id)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Subject Info */}
      <div className="flex-1">
        <h4 className="text-base font-semibold text-gray-900">{subject.subject.name}</h4>
        <p className="text-sm text-gray-600">
          {teacher ? <> Assigned to: {teacher?.full_name}</> : "No Teacher Assigned"}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVerticalIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onToggleAssignTeacher(!!teacher)}>
            {teacher ? (
              <>
                <CircleSlash2Icon className="mr-2 h-4 w-4" />
                Unassign Teacher
              </>
            ) : (
              <>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Assign Teacher
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
