"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
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
  showAllStudents?: boolean
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

// Helper function to initialize grades from students and existing submission
const initializeGrades = (
  students: Student[],
  existingSubmission?: GradeSubmission
): Record<string, GradeEntry & { id?: string }> => {
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
}

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
  // Track filter key to detect changes
  const filterKey = `${selectedClass}-${selectedSubject}-${selectedTerm}`
  const prevFilterKeyRef = useRef(filterKey)

  // Store grades with student_id as key
  const [grades, setGrades] = useState<Record<string, GradeEntry & { id?: string }>>({})

  // Update grades when filters or data changes
  useEffect(() => {
    // Only initialize grades when we have valid filters
    if (selectedClass && selectedSubject && selectedTerm) {
      const currentFilterKey = `${selectedClass}-${selectedSubject}-${selectedTerm}`

      // Check if filters changed or if this is initial load with existing submission
      const filtersChanged = prevFilterKeyRef.current !== currentFilterKey

      if (filtersChanged || !Object.keys(grades).length) {
        prevFilterKeyRef.current = currentFilterKey

        // Use setTimeout to avoid setting state during render
        const timer = setTimeout(() => {
          setGrades(initializeGrades(students, existingSubmission))
        }, 0)

        return () => clearTimeout(timer)
      }
    }
  }, [selectedClass, selectedSubject, selectedTerm, students, existingSubmission, grades])

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
    return Object.values(grades)
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
  }, [grades])

  const hasValidGrades = gradeEntries.length > 0

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

      {/* Info Messages */}
      {!selectedClass && !selectedSubject && !selectedTerm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Please select a class to view students. Then select a subject and term to
            enter grades.
          </p>
        </div>
      )}

      {selectedClass && !selectedSubject && !selectedTerm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            All students in {classes.find((c) => c.id === selectedClass)?.name} are
            displayed. Select a subject and term to enter grades.
          </p>
        </div>
      )}

      {selectedClass && (selectedSubject || selectedTerm) && !canShowResults && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Please select both a subject and term to enter grades.
          </p>
        </div>
      )}

      {/* Loading indicator for submission data */}
      {canShowResults && isLoadingStudents && (
        <div className="flex items-center justify-center rounded-lg border bg-white p-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">Loading existing grades...</span>
        </div>
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
          <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
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
          grades={grades}
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
