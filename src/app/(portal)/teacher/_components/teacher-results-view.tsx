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

interface TeacherResultsViewProps {
  classes: Class[]
  subjects: Subject[]
  terms: Term[]
  students: Student[]
  gradingScale: GradingScale[]
  selectedClass: string
  selectedSubject: string
  selectedTerm: string
  onClassChange: (classId: string) => void
  onSubjectChange: (subjectId: string) => void
  onTermChange: (termId: string) => void
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
  terms = [],
  students = [],
  gradingScale,
  selectedClass,
  selectedSubject,
  selectedTerm,
  onClassChange,
  onSubjectChange,
  onTermChange,
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
  const noSubjectsForClass = selectedClass && subjects.length === 0

  // Show loading state when students are loading
  if (isLoadingStudents) {
    return (
      <div className="space-y-6">
        <FilterSection
          classes={classes}
          subjects={subjects}
          terms={terms}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedTerm={selectedTerm}
          onClassChange={onClassChange}
          onSubjectChange={onSubjectChange}
          onTermChange={onTermChange}
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
        terms={terms}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        selectedTerm={selectedTerm}
        onClassChange={onClassChange}
        onSubjectChange={onSubjectChange}
        onTermChange={onTermChange}
      />

      {/* Warning for no subjects */}
      {noSubjectsForClass && (
        <InfoState
          title="No Subjects Assigned"
          message="You are not assigned to teach any subjects in this class. Please select a different class or contact the administrator."
          variant="warning"
        />
      )}

      {/* Info Messages */}
      {selectedClass && !selectedSubject && !selectedTerm && (
        <InfoState
          title="Select Subject and Term"
          message="All students in this class are displayed. Select a subject and term to enter grades."
          variant="info"
        />
      )}

      {selectedClass && (selectedSubject || selectedTerm) && !canShowResults && (
        <InfoState
          title="Incomplete Selection"
          message="Please select both a subject and term to enter grades."
          variant="warning"
        />
      )}

      {/* Only show grading scale and actions when all filters are selected */}
      {canShowResults && (
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
      {canShowResults && (
        <div className="rounded-lg border bg-white p-4">
          <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
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

      {/* Show students table if class is selected */}
      {selectedClass && (
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
