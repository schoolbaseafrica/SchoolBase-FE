"use client"

import { useState, useEffect } from "react"
import { AdminResultsView } from "./_components/admin-results-view"
import { useGetAdminSubmissions, useGetSubmissionStats } from "./_hooks/use-admin-results"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function AdminResultsPage() {
  const period = useAcademicPeriod("admin-results")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const {
    data: submissions = [],
    isLoading,
    isError,
  } = useGetAdminSubmissions({
    status: statusFilter === "all" ? undefined : statusFilter,
    term_id: period.termId,
    academic_session_id: period.sessionId,
  })
  const { data: stats, refetch: refetchStats } = useGetSubmissionStats({
    term_id: period.termId,
    academic_session_id: period.sessionId,
  })

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      submission.teacher?.name?.toLowerCase().includes(searchLower) ||
      submission.class?.name?.toLowerCase().includes(searchLower) ||
      submission.class?.arm?.toLowerCase().includes(searchLower) ||
      submission.class?.stream?.toLowerCase().includes(searchLower) ||
      submission.subject?.name?.toLowerCase().includes(searchLower) ||
      submission.term?.name?.toLowerCase().includes(searchLower)
    )
  })

  // Refresh stats when submissions change
  useEffect(() => {
    refetchStats()
  }, [submissions, refetchStats])

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
          <p className="text-gray-600">
            Review and manage grade submissions from teachers
          </p>
        </div>
        <AcademicPeriodSelector scope="admin-results" />

        <AdminResultsView
          submissions={filteredSubmissions}
          stats={stats}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  )
}
