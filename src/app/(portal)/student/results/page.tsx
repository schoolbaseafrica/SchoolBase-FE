"use client"

import { StudentResultsView } from "./_components/student-results-view"
import { ResultsContainer } from "@/components/results/results-container"
import { useStudentAuth } from "@/hooks/use-auth-user"
import { useGetActiveTerm } from "./_hooks/use-student-results"
import { useGetStudentResults } from "./_hooks/use-student-results"

export default function StudentResultsPage() {
  // Get current student from auth
  const {
    studentId,
    studentName,
    isLoading: isLoadingAuth,
    error: authError,
    isStudent,
  } = useStudentAuth()

  // Get active term
  const {
    data: activeTerm,
    isLoading: isLoadingTerm,
    error: termError,
    refetch: refetchTerm,
  } = useGetActiveTerm()

  // Get student results for active term
  const {
    data: results = [],
    isLoading: isLoadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useGetStudentResults(studentId)

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
    if (authError)
      window.location.reload() // Refresh for auth errors
    else if (termError) refetchTerm()
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
  )
}
