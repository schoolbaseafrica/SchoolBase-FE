"use client"

import { StudentResultsView } from "./_components/student-results-view"
import { ResultsContainer } from "@/components/results/results-container"
import { useStudentAuth } from "@/hooks/use-auth-user"
import { useGetStudentResults } from "./_hooks/use-student-results"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function StudentResultsPage() {
  const period = useAcademicPeriod("student-results")
  // Get current student from auth
  const {
    studentId,
    studentName,
    isLoading: isLoadingAuth,
    error: authError,
    isStudent,
  } = useStudentAuth()

  // Get active term
  // Get student results for active term
  const {
    data: results = [],
    isLoading: isLoadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useGetStudentResults(studentId, period.termId)

  const isLoading = isLoadingAuth || period.isLoading || isLoadingResults
  const error = authError || resultsError

  // Debug logging
  console.log("[StudentResultsPage] State:", {
    studentId,
    studentName,
    isLoadingAuth,
    isLoadingResults,
    isLoading,
    authError,
    resultsError,
    activeTerm: period.term,
    resultsCount: results?.length || 0,
    results,
  })

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
    if (authError)
      window.location.reload() // Refresh for auth errors
    else if (resultsError) refetchResults()
  }

  // Check if user is a student
  if (!isLoading && !isStudent && !authError) {
    return (
      <ResultsContainer
        title="Access Denied"
        subtitle=""
        isLoading={false}
        error={new Error("This page is only accessible to students.")}
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
        <AcademicPeriodSelector scope="student-results" allowWholeSession={false} />
      </div>
      <ResultsContainer
        title="My Results"
        subtitle="View and download your academic results"
        isLoading={isLoading}
        error={error}
        isEmpty={!studentId || results.length === 0}
        emptyTitle={studentId ? "No Results Available" : "Student Profile Not Found"}
        emptyDescription={
          studentId
            ? "No results are available for the current term. Results will appear here once they are approved by your teacher and admin."
            : "Unable to load your student profile. Please try again or contact support."
        }
        onRetry={handleRetry}
      >
        {studentId && studentName && (
          <StudentResultsView
            studentId={studentId}
            studentName={studentName}
            activeTerm={transformedTerm}
            results={results}
            isLoading={isLoading}
          />
        )}
      </ResultsContainer>
    </>
  )
}
