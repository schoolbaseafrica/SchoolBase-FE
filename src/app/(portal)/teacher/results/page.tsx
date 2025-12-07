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

  const { data: classes = [] } = useGetClasses()
  const { data: subjects = [] } = useGetSubjects(selectedClass)
  const { data: terms = [] } = useGetTerms()

  const { data: students = [], isLoading: isLoadingStudents } = useGetStudents(
    selectedClass,
    selectedSubject
  )

  const { data: gradingScale = [] } = useGetGradingScale()

  // Use the new specific submission hook
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

  const showAllStudents = useMemo(() => {
    return !!selectedClass
  }, [selectedClass])

  // Get academic session ID from selected class
  const academicSessionId = useMemo(() => {
    const selectedClassObj = classes.find((c) => c.id === selectedClass)
    const classWithSession = selectedClassObj as Class & { academic_session_id?: string }
    return classWithSession?.academic_session_id || ""
  }, [classes, selectedClass])

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
          showAllStudents={showAllStudents}
          academicSessionId={academicSessionId}
        />
      </div>
    </div>
  )
}
