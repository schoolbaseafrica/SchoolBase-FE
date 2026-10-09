"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Class,
  Subject,
  Term,
  Student,
  GradingScale,
  GradeEntry,
  GradeSubmission,
} from "@/types/result"
import { FilterSection } from "./filter-section"
import { GradingScaleCard } from "./grading-scale-card"
import { StudentsTable } from "./students-table"
import { SubmissionActions } from "./submission-actions"
import { Loader2 } from "lucide-react"
import { InfoState } from "./ui/info-state"
import { ErrorState } from "./ui/error-state"
import { Button } from "@/components/ui/button"

interface TeacherResultsViewProps {
  classes: Class[]
  subjects: Subject[]
  subjectsError: boolean
  onRetrySubjects: () => void
  studentsError: boolean
  onRetryStudents: () => void
  submissionError: boolean
  onRetrySubmission: () => void
  terms: Term[]
  students: Student[]
  gradingScale: GradingScale[]
  selectedClass: string
  selectedSubject: string
  selectedTerm: string
  onClassChange: (classId: string) => void
  onSubjectChange: (subjectId: string) => void
  isLoadingStudents: boolean
  canShowResults: boolean
  existingSubmission?: GradeSubmission
  academicSessionId: string
}

// Helper function to create empty grade entry
const createEmptyGradeEntry = (studentId: string): GradeEntry & { id?: string } => ({
  student_id: studentId,
  ca_score: null,
  exam_score: null,
  total_score: null,
  grade: null,
  comment: null,
})

export function TeacherResultsView({
  classes = [],
  subjects = [],
  subjectsError,
  onRetrySubjects,
  studentsError,
  onRetryStudents,
  submissionError,
  onRetrySubmission,
  terms = [],
  students = [],
  gradingScale,
  selectedClass,
  selectedSubject,
  selectedTerm,
  onClassChange,
  onSubjectChange,
  isLoadingStudents,
  canShowResults,
  existingSubmission,
  academicSessionId,
}: TeacherResultsViewProps) {
  // Store grades with student_id as key - only for user edits
  const [grades, setGrades] = useState<Record<string, GradeEntry & { id?: string }>>({})

  // Compute initial grades directly during render (no useEffect, no useMemo with setState)
  const initialGrades = useMemo(() => {
    if (students.length === 0) return {}

    const newGrades: Record<string, GradeEntry & { id?: string }> = {}

    // First, populate from existing submission if available
    if (existingSubmission?.grades) {
      existingSubmission.grades.forEach((grade) => {
        if (grade.student_id) {
          newGrades[grade.student_id] = {
            id: grade.id,
            student_id: grade.student_id,
            ca_score: grade.ca_score,
            exam_score: grade.exam_score,
            total_score: grade.total_score,
            grade: grade.grade,
            comment: grade.comment || null,
          }
        }
      })
    }

    // Then ensure all current students have an entry
    students.forEach((student) => {
      if (!newGrades[student.id]) {
        newGrades[student.id] = createEmptyGradeEntry(student.id)
      }
    })

    return newGrades
  }, [students, existingSubmission])

  // Merge initial grades with user edits
  const allGrades = useMemo(() => {
    // Start with initial grades
    const merged = { ...initialGrades }

    // Apply any user edits from the grades state
    Object.keys(grades).forEach((studentId) => {
      if (merged[studentId]) {
        merged[studentId] = {
          ...merged[studentId],
          ...grades[studentId],
        }
      }
    })

    return merged
  }, [initialGrades, grades])

  const handleGradeUpdate = useCallback(
    (studentId: string, updatedGrade: GradeEntry & { id?: string }) => {
      setGrades((prev) => ({
        ...prev,
        [studentId]: updatedGrade,
      }))
    },
    []
  )

  // Get grade entries ready for submission
  const gradeEntries = useMemo(() => {
    return Object.values(allGrades)
      .filter(
        (grade) =>
          grade.student_id && (grade.ca_score !== null || grade.exam_score !== null)
      )
      .map((grade) => ({
        id: grade.id,
        student_id: grade.student_id,
        ca_score: grade.ca_score,
        exam_score: grade.exam_score,
        total_score: grade.total_score,
        grade: grade.grade,
        comment: grade.comment,
      }))
  }, [allGrades])

  const hasValidGrades = gradeEntries.length > 0

  // Check if subjects are available for selected class
  const noSubjectsForClass = selectedClass && !subjectsError && subjects.length === 0

  // Show loading state when students are loading
  if (isLoadingStudents) {
    return (
      <div className="space-y-6">
        <FilterSection
          classes={classes}
          subjects={subjects}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onClassChange={onClassChange}
          onSubjectChange={onSubjectChange}
        />
        <div className="rounded-lg border bg-white p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterSection
        classes={classes}
        subjects={subjects}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        onClassChange={onClassChange}
        onSubjectChange={onSubjectChange}
      />

      {subjectsError ? (
        <ErrorState
          title="Could not load subject assignments"
          message="Try again. If this continues, ask your administrator to check your teacher profile and subject assignments."
          action={
            <Button variant="outline" onClick={onRetrySubjects}>
              Try again
            </Button>
          }
        />
      ) : noSubjectsForClass ? (
        <InfoState
          title="No subjects assigned to you"
          message="This class is assigned to you, but none of its subjects are assigned to you for result entry. Ask an administrator to assign you to a subject in Class Management."
          variant="warning"
        />
      ) : !selectedClass ? (
        <InfoState
          title="Choose a class"
          message="Select one of your assigned classes to begin entering results."
          variant="info"
        />
      ) : !selectedSubject ? (
        <InfoState
          title="Choose a subject"
          message="Select the subject you teach in this class to see its grade entry table."
          variant="info"
        />
      ) : !selectedTerm ? (
        <InfoState
          title="Choose a term"
          message="Select an academic term in the period selector above to enter grades for this subject."
          variant="info"
        />
      ) : studentsError ? (
        <ErrorState
          title="Could not load students"
          message="Try loading the class roster again before entering grades."
          action={<Button onClick={onRetryStudents}>Try again</Button>}
        />
      ) : submissionError ? (
        <ErrorState
          title="Could not load saved grades"
          message="Try again before editing. Your existing grades must be loaded to avoid overwriting them."
          action={<Button onClick={onRetrySubmission}>Try again</Button>}
        />
      ) : null}

      {/* Only show grading scale and actions when all filters are selected */}
      {canShowResults && !studentsError && !submissionError && (
        <>
          <GradingScaleCard gradingScale={gradingScale} />

          {hasValidGrades && (
            <SubmissionActions
              classId={selectedClass}
              subjectId={selectedSubject}
              termId={selectedTerm}
              grades={gradeEntries}
              existingSubmission={existingSubmission}
              academicSessionId={academicSessionId}
            />
          )}
        </>
      )}

      {/* Class Info - Show Academic Session */}
      {canShowResults && !studentsError && !submissionError && (
        <div className="rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Class</p>
              <p className="text-lg font-semibold">
                {classes.find((c) => c.id === selectedClass)?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Subject</p>
              <p className="text-lg font-semibold">
                {subjects.find((s) => s.id === selectedSubject)?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Term</p>
              <p className="text-lg font-semibold">
                {terms.find((t) => t.id === selectedTerm)?.name || "-"}
              </p>
            </div>
          </div>

          {/* Submission Status */}
          {existingSubmission && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Status: </span>
              <span
                className={`text-sm font-semibold ${
                  existingSubmission.status === "approved"
                    ? "text-green-600"
                    : existingSubmission.status === "rejected"
                      ? "text-red-600"
                      : existingSubmission.status === "submitted"
                        ? "text-blue-600"
                        : "text-gray-600"
                }`}
              >
                {existingSubmission.status?.toUpperCase()}
              </span>
              {existingSubmission.rejection_reason && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Rejection Reason:{" "}
                  </span>
                  <span className="text-sm text-red-600">
                    {existingSubmission.rejection_reason}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grade editing is available only for a valid class, subject, and term. */}
      {canShowResults && !studentsError && !submissionError && (
        <StudentsTable
          students={students}
          grades={allGrades}
          onGradeUpdate={handleGradeUpdate}
          isLoading={isLoadingStudents}
          classId={selectedClass}
          subjectId={selectedSubject}
          termId={selectedTerm}
          academicSessionId={academicSessionId}
        />
      )}
    </div>
  )
}
