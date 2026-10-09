"use client"

import { useState, useMemo } from "react"
import { TeacherResultsView } from "../_components/teacher-results-view"
import {
  useGetClasses,
  useGetSubjects,
  useGetTerms,
  useGetStudents,
  useGetGradingScale,
  useGetSubmissionByFilters,
} from "../_hooks/use-results"
import { useAuthUser } from "@/hooks/use-auth-user"
import { ErrorState } from "../_components/ui/error-state"
import { InfoState } from "../_components/ui/info-state"
import { SkeletonLoader } from "../_components/ui/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

interface Class {
  id: string
  name: string
  academic_session_id: string
}

// Helper to safely get localStorage value
const getStoredValue = (key: string): string => {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(key) || ""
}

export default function TeacherResultsPage() {
  const period = useAcademicPeriod("teacher-results")
  const { data: teacher, isLoading: isLoadingAuth } = useAuthUser()

  // Initialize state from localStorage directly in useState
  const [selectedClass, setSelectedClass] = useState<string>(() =>
    getStoredValue("results_selectedClass")
  )
  const [selectedSubject, setSelectedSubject] = useState<string>(() =>
    getStoredValue("results_selectedSubject")
  )
  const selectedTerm = period.termId ?? ""

  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    error: classesError,
  } = useGetClasses(period.sessionId)
  const effectiveClass = classes.some((item) => item.id === selectedClass)
    ? selectedClass
    : ""

  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
    isError: subjectsError,
    refetch: refetchSubjects,
  } = useGetSubjects(effectiveClass, teacher?.teacher_id)
  const effectiveSubject = subjects.some((item) => item.id === selectedSubject)
    ? selectedSubject
    : ""

  const { data: terms = [], isLoading: isLoadingTerms } = useGetTerms(period.sessionId)
  const effectiveTerm = terms.some((item) => item.id === selectedTerm) ? selectedTerm : ""

  const {
    data: students = [],
    isLoading: isLoadingStudents,
    isError: studentsError,
    refetch: refetchStudents,
  } = useGetStudents(effectiveClass, effectiveSubject)

  const { data: gradingScale = [] } = useGetGradingScale()

  const {
    data: existingSubmission,
    isLoading: isLoadingSubmission,
    isError: submissionError,
    refetch: refetchSubmission,
  } = useGetSubmissionByFilters(effectiveClass, effectiveSubject, effectiveTerm)

  // Handle class change with subject reset and persistence. The period selector owns the term.
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId)
    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedClass", classId)
    }

    // A subject assignment belongs to the selected class.
    setSelectedSubject("")

    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedSubject", "")
    }
  }

  // Handle subject change with persistence
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedSubject", subjectId)
    }
  }

  const canShowResults = Boolean(effectiveClass && effectiveSubject && effectiveTerm)

  // Get academic session ID from selected class
  const academicSessionId = useMemo(() => {
    const selectedClassObj = classes.find((c) => c.id === effectiveClass)
    const classWithSession = selectedClassObj as Class & { academic_session_id?: string }
    return classWithSession?.academic_session_id || ""
  }, [classes, effectiveClass])

  // Check if teacher is assigned to any classes
  const isNotAssigned = useMemo(() => {
    return !isLoadingClasses && !classesError && classes.length === 0
  }, [classes, isLoadingClasses, classesError])

  // Show loading state for initial auth
  if (isLoadingAuth) {
    return (
      <div>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
        {/* <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl"><SkeletonLoader /></div>
        </div> */}
      </div>
    )
  }

  // Check if user is a teacher
  if (teacher && !teacher.role.includes("TEACHER")) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <ErrorState
          title="Access Denied"
          message="This page is only accessible to teachers. Please contact your administrator if you believe this is an error."
          icon="alert"
          action={
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // A teacher may have classes in other academic sessions.
  if (isNotAssigned) {
    const sessionName = period.sessions.find((item) => item.id === period.sessionId)?.name
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="portal-reveal max-w-3xl">
          <p className="portal-section-label mb-2">Academic records</p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Results
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Enter and manage grades for your assigned subjects.
          </p>
        </div>
        <AcademicPeriodSelector scope="teacher-results" allowWholeSession={false} />
        <InfoState
          title="No classes in this session"
          message={`You have no class assignment${sessionName ? ` in ${sessionName}` : " for this session"}. Choose another session above, or ask an administrator to check your class assignment.`}
        />
      </div>
    )
  }

  // Show loading state
  if (isLoadingClasses || isLoadingSubjects || isLoadingTerms) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
            <p className="text-gray-600">Enter and manage student results</p>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    )
  }

  // Show error state for classes
  if (classesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <ErrorState
          title="Error Loading Classes"
          message="There was an error loading your assigned classes. Please try refreshing the page or contact support if the issue persists."
          icon="alert"
          action={<Button onClick={() => window.location.reload()}>Refresh Page</Button>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="portal-reveal max-w-3xl">
        <p className="portal-section-label mb-2">Academic records</p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Results
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Enter and manage grades for your assigned subjects.
        </p>
      </div>
      <div>
        <AcademicPeriodSelector scope="teacher-results" allowWholeSession={false} />

        <section className="portal-reveal rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-4 shadow-sm sm:p-6">
          <TeacherResultsView
            key={`${effectiveClass}:${effectiveSubject}:${effectiveTerm}`}
            classes={classes}
            subjects={subjects}
            subjectsError={
              subjectsError || Boolean(effectiveClass && !teacher?.teacher_id)
            }
            onRetrySubjects={() => void refetchSubjects()}
            studentsError={studentsError}
            onRetryStudents={() => void refetchStudents()}
            submissionError={submissionError}
            onRetrySubmission={() => void refetchSubmission()}
            terms={terms}
            students={students}
            gradingScale={gradingScale}
            selectedClass={effectiveClass}
            selectedSubject={effectiveSubject}
            selectedTerm={effectiveTerm}
            onClassChange={handleClassChange}
            onSubjectChange={handleSubjectChange}
            isLoadingStudents={isLoadingStudents || isLoadingSubmission}
            canShowResults={canShowResults}
            existingSubmission={existingSubmission || undefined}
            academicSessionId={academicSessionId}
          />
        </section>
      </div>
    </div>
  )
}
