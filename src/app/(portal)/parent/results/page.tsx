"use client"

import { ParentResultsView } from "./_components/parent-results-view"
import { ResultsContainer } from "@/components/results/results-container"
import { useParentAuth } from "@/hooks/use-auth-user"
import { useGetActiveTerm, useGetStudentResults } from "./_hooks/use-parent-results"
import { StudentSelector } from "../_components/student-selector"
import { useParentStudents } from "../_components/student-provider"

export default function ParentResultsPage() {
  // Use the student provider for consistent student selection across all parent pages
  const { selectedStudent, studentID, students } = useParentStudents()

  // Get parent auth info
  const { isParent, isLoading: isLoadingAuth, error: authError } = useParentAuth()

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
  } = useGetStudentResults(studentID)

  const isLoading = isLoadingAuth || isLoadingTerm || isLoadingResults
  const error = authError || termError || resultsError

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

  const handleRetry = () => {
    if (authError) window.location.reload()
    else if (termError) refetchTerm()
    else if (resultsError) refetchResults()
  }

  const studentsArray = students || []

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
      isEmpty={studentsArray.length === 0}
      emptyTitle="No Children Linked"
      emptyDescription="No students are linked to your parent account. Please contact your school administrator."
      onRetry={handleRetry}
    >
      {studentsArray.length > 0 ? (
        <div>
          {/* Student Selection */}
          {studentsArray.length > 1 && (
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-lg font-semibold">Select Child:</h2>
              <StudentSelector className="w-auto min-w-[200px]" />
            </div>
          )}

          {/* Parent Results View */}
          {selectedStudent ? (
            <ParentResultsView
              selectedStudent={{
                ...selectedStudent,
                registration_number: selectedStudent.registration_number || "",
              }}
              activeTerm={transformedTerm}
              results={results}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500">Please select a student to view results</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </ResultsContainer>
  )
}
