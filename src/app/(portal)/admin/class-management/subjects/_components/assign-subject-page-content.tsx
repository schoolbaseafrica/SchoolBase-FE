"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ItemLoader } from "../../../_components/sub-loader"
import { ItemsError } from "../../../_components/loading-error"
import EmptyState from "../../../_components/empty-state"
import AssignSubjectForm from "./assign-subject-form"
import AssignSubjectSuccess from "./assign-subject-success"
import NotFound from "@/app/not-found"
import { useGetSubject } from "../_hooks/use-subjects"
import { useGetClassesInfo } from "../../_hooks/use-classes"
import ActiveSessionGuard from "../../session/_components/active-session-required"
import { useActiveAcademicSession } from "../../session/_hooks/use-session"

export default function AssignSubjectPageContent() {
  const subject_id = useParams().subject_id as string
  const router = useRouter()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Check for active session
  const { data: currentSession, isLoading: isLoadingSession } = useActiveAcademicSession()

  const {
    data: subject,
    isLoading: isLoadingSubject,
    isError: isErrorSubject,
    error: errorSubject,
    refetch: refetchSubject,
  } = useGetSubject(subject_id)

  const {
    data: classesInfo,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClassesInfo()

  // Safely extract classes with better error handling
  const classes = classesInfo?.items || []

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[AssignSubject] ClassesInfo:", classesInfo)
    console.log("[AssignSubject] Classes:", classes)
    console.log("[AssignSubject] Subject:", subject)
  }

  // Transform the nested structure to a flat list of classes
  const classItems = classes
    .flatMap((cls) => {
      // Ensure cls.classes exists and is an array
      if (!cls.classes || !Array.isArray(cls.classes)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[AssignSubject] Class group "${cls.name}" has no classes array:`,
            cls
          )
        }
        return []
      }

      // Map each class in the group to a flat structure
      return cls.classes
        .map((c) => {
          if (!c || !c.id) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `[AssignSubject] Invalid class item in group "${cls.name}":`,
                c
              )
            }
            return null
          }
          return {
            id: c.id,
            name: `${cls.name}${c.arm ? ` ${c.arm}` : ""}`.trim(),
          }
        })
        .filter((item): item is { id: string; name: string } => item !== null)
    })
    .filter((item): item is { id: string; name: string } => item !== null)

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[AssignSubject] ClassItems:", classItems)
  }

  const isLoading = isLoadingSession || isLoadingSubject || isLoadingClasses
  const isError = isErrorSubject || isErrorClasses
  const error = errorSubject || errorClasses

  if (!subject_id) {
    return <NotFound />
  }

  // Show active session guard if no active session
  if (!isLoadingSession && !currentSession) {
    return <ActiveSessionGuard />
  }

  return (
    <>
      {isLoading ? (
        <ItemLoader item="Classes" />
      ) : isError ? (
        <ItemsError
          item="Classes"
          reload={() => {
            refetchSubject()
            refetchClasses()
          }}
          errorMessage={error?.message || "An unexpected error occurred."}
        />
      ) : !subject ? (
        <ItemsError
          item="Subject"
          reload={refetchSubject}
          errorMessage="Subject not found"
        />
      ) : !classItems || classItems.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <svg
                className="h-8 w-8 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Classes Available</h2>
            <p className="text-gray-600">
              {!currentSession
                ? "No active academic session found. You need to create and activate an academic session first before you can create classes and assign subjects."
                : classes.length === 0
                  ? `No classes found in the current active academic session (${currentSession.name}). Please create classes for this session first, then you can assign subjects to them.`
                  : `Found ${classes.length} class group(s) but they contain no individual classes. Please check your class structure.`}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {!currentSession ? (
                <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
                  <Link href="/admin/class-management/session/create-session">
                    Create Active Session
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/admin/class-management/class/new">Create Classes</Link>
                  </Button>
                  <Button variant="outline" onClick={() => refetchClasses()}>
                    Refresh
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AssignSubjectForm
          subject={subject}
          classes={classItems}
          onSuccess={handleSuccess}
        />
      )}

      <AssignSubjectSuccess
        open={showSuccessDialog}
        setOpen={setShowSuccessDialog}
        onGoHome={handleGoHome}
      />
    </>
  )

  function handleSuccess() {
    setShowSuccessDialog(true)
  }

  function handleGoHome() {
    router.push("/admin/class-management/subjects")
  }
}
