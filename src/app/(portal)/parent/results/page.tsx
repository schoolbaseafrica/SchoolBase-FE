"use client"

import { ParentResultsView } from "./_components/parent-results-view"
import { ResultsContainer } from "@/components/results/results-container"
import { useParentAuth } from "@/hooks/use-auth-user"
import { useGetStudentResults } from "./_hooks/use-parent-results"
import { StudentSelector } from "../_components/student-selector"
import { useParentStudents } from "../_components/student-provider"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function ParentResultsPage() {
  const period = useAcademicPeriod("parent-results")
  // Use the student provider for consistent student selection across all parent pages
  const { selectedStudent, studentID, students } = useParentStudents()

  // Get parent auth info
  const { isParent, isLoading: isLoadingAuth, error: authError } = useParentAuth()

  // Get active term
  // Get student results for selected student
  const {
    data: results = [],
    isLoading: isLoadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useGetStudentResults(studentID, period.termId)

  const isLoading = isLoadingAuth || period.isLoading || isLoadingResults
  const error = authError || resultsError

  // Transform term data
  const transformedTerm = period.term
    ? {
        id: period.term.id,
        name: period.term.name,
        start_date: period.term.startDate,
        end_date: period.term.endDate,
        status: period.term.status,
        is_active: period.term.isActive,
      }
    : undefined

  const handleRetry = () => {
    if (authError) window.location.reload()
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
    <>
      <div className="px-4 md:px-6">
        <AcademicPeriodSelector scope="parent-results" allowWholeSession={false} />
      </div>
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
    </>
  )
}
