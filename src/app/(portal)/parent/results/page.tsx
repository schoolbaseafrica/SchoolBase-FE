"use client"

import { ParentResultsView } from "./_components/parent-results-view"
import { ResultsContainer } from "@/components/results/results-container"
import { useParentAuth } from "@/hooks/use-auth-user"
import {
  useGetLinkedStudents,
  useGetActiveTerm,
  useGetStudentResults,
} from "./_hooks/use-parent-results"
import { useState, useEffect } from "react"

export default function ParentResultsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>()

  // Get parent auth info
  const { isParent, isLoading: isLoadingAuth, error: authError } = useParentAuth()

  // Get linked students for the parent
  const {
    data: linkedStudents = [],
    isLoading: isLoadingStudents,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetLinkedStudents()

  // Get active term
  const {
    data: activeTerm,
    isLoading: isLoadingTerm,
    error: termError,
    refetch: refetchTerm,
  } = useGetActiveTerm()

  // Get student results for selected student
  const {
    data: results = [],
    isLoading: isLoadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useGetStudentResults(selectedStudentId)

  const isLoading =
    isLoadingAuth || isLoadingStudents || isLoadingTerm || isLoadingResults
  const error = authError || studentsError || termError || resultsError

  // Transform term data
  const transformedTerm = activeTerm
    ? {
        id: activeTerm.id,
        name: activeTerm.name,
        start_date: activeTerm.startDate,
        end_date: activeTerm.endDate,
        status: activeTerm.status,
        is_active: activeTerm.isCurrent,
      }
    : undefined

  // Auto-select first student if none selected
  useEffect(() => {
    if (!selectedStudentId && linkedStudents.length > 0) {
      // Use a timeout to avoid synchronous state update in useEffect
      const timer = setTimeout(() => {
        setSelectedStudentId(linkedStudents[0].id)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [linkedStudents, selectedStudentId])

  const handleRetry = () => {
    if (authError) window.location.reload()
    else if (studentsError) refetchStudents()
    else if (termError) refetchTerm()
    else if (resultsError) refetchResults()
  }

  const selectedStudent = linkedStudents.find((s) => s.id === selectedStudentId)

  // Check if user is a parent
  if (!isLoading && !isParent && !authError) {
    return (
      <ResultsContainer
        title="Access Denied"
        subtitle=""
        isLoading={false}
        error={new Error("This page is only accessible to parents.")}
        isEmpty={false}
        emptyTitle=""
        emptyDescription=""
        onRetry={() => (window.location.href = "/dashboard")}
      >
        {/* Add children prop to fix TypeScript error */}
        <div></div>
      </ResultsContainer>
    )
  }

  return (
    <ResultsContainer
      title="Children's Results"
      subtitle="View and download your children's academic results"
      isLoading={isLoading}
      error={error}
      isEmpty={linkedStudents.length === 0}
      emptyTitle="No Children Linked"
      emptyDescription="No students are linked to your parent account. Please contact your school administrator."
      onRetry={handleRetry}
      customEmptyState={
        linkedStudents.length > 0 && selectedStudent ? (
          <div>
            {/* Student Selection */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Select Child</h2>
              <div className="flex flex-wrap gap-3">
                {linkedStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`rounded-lg border px-4 py-3 transition-colors ${
                      selectedStudentId === student.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {student.registration_number}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parent Results View */}
            <ParentResultsView
              selectedStudent={selectedStudent}
              activeTerm={transformedTerm}
              results={results}
              isLoading={isLoading}
            />
          </div>
        ) : null
      }
    >
      <div>
        {/* Student Selection */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Select Child</h2>
          <div className="flex flex-wrap gap-3">
            {linkedStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`rounded-lg border px-4 py-3 transition-colors ${
                  selectedStudentId === student.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="font-medium">{student.full_name}</p>
                  <p className="text-sm text-gray-600">{student.registration_number}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Parent Results View */}
        <ParentResultsView
          selectedStudent={selectedStudent!}
          activeTerm={transformedTerm}
          results={results}
          isLoading={isLoading}
        />
      </div>
    </ResultsContainer>
  )
}
