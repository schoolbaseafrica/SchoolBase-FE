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
import { SkeletonLoader } from "../_components/ui/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Home, Loader2 } from "lucide-react"
import Link from "next/link"

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
  const { data: teacher, isLoading: isLoadingAuth } = useAuthUser()

  // Initialize state from localStorage directly in useState
  const [selectedClass, setSelectedClass] = useState<string>(() =>
    getStoredValue("results_selectedClass")
  )
  const [selectedSubject, setSelectedSubject] = useState<string>(() =>
    getStoredValue("results_selectedSubject")
  )
  const [selectedTerm, setSelectedTerm] = useState<string>(() =>
    getStoredValue("results_selectedTerm")
  )

  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    error: classesError,
  } = useGetClasses()

  const { data: subjects = [], isLoading: isLoadingSubjects } = useGetSubjects(
    selectedClass,
    teacher?.teacher_id
  )

  const { data: terms = [], isLoading: isLoadingTerms } = useGetTerms()

  const { data: students = [], isLoading: isLoadingStudents } = useGetStudents(
    selectedClass,
    selectedSubject
  )

  const { data: gradingScale = [] } = useGetGradingScale()

  const { data: existingSubmission, isLoading: isLoadingSubmission } =
    useGetSubmissionByFilters(selectedClass, selectedSubject, selectedTerm)

  // Handle class change with subject/term reset and persistence
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId)
    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedClass", classId)
    }

    // Reset subject and term when class changes
    setSelectedSubject("")
    setSelectedTerm("")

    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedSubject", "")
      localStorage.setItem("results_selectedTerm", "")
    }
  }

  // Handle subject change with persistence
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedSubject", subjectId)
    }
  }

  // Handle term change with persistence
  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId)
    if (typeof window !== "undefined") {
      localStorage.setItem("results_selectedTerm", termId)
    }
  }

  // Use useMemo for derived state
  const canShowResults = useMemo(() => {
    return Boolean(selectedClass && selectedSubject && selectedTerm)
  }, [selectedClass, selectedSubject, selectedTerm])

  // const showAllStudents = useMemo(() => {
  //   return !!selectedClass
  // }, [selectedClass])

  // Get academic session ID from selected class
  const academicSessionId = useMemo(() => {
    const selectedClassObj = classes.find((c) => c.id === selectedClass)
    const classWithSession = selectedClassObj as Class & { academic_session_id?: string }
    return classWithSession?.academic_session_id || ""
  }, [classes, selectedClass])

  // Check if teacher is assigned to any classes
  const isNotAssigned = useMemo(() => {
    return !isLoadingClasses && classes.length === 0
  }, [classes, isLoadingClasses])

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

  // Show error if teacher is not assigned to any classes
  if (isNotAssigned) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <ErrorState
          title="No Classes Assigned"
          message="You are not assigned to any classes. Please contact the administrator to be assigned to a class before you can manage results."
          icon="book"
          action={
            <Link href="/teacher">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go to Teacher Dashboard
              </Button>
            </Link>
          }
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
          <p className="text-gray-600">Enter and manage student results</p>
        </div>

        <TeacherResultsView
          classes={classes}
          subjects={subjects}
          terms={terms}
          students={students}
          gradingScale={gradingScale}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedTerm={selectedTerm}
          onClassChange={handleClassChange}
          onSubjectChange={handleSubjectChange}
          onTermChange={handleTermChange}
          isLoadingStudents={isLoadingStudents || isLoadingSubmission}
          canShowResults={canShowResults}
          existingSubmission={existingSubmission || undefined}
          // showAllStudents={showAllStudents}
          academicSessionId={academicSessionId}
        />
      </div>
    </div>
  )
}
