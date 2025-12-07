"use client"

import { useState, useEffect } from "react"
import { AdminResultsView } from "./_components/admin-results-view"
import { useGetAdminSubmissions, useGetSubmissionStats } from "./_hooks/use-admin-results"

export default function AdminResultsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: submissions = [], isLoading } = useGetAdminSubmissions({
    status: statusFilter === "all" ? undefined : statusFilter,
  })
  const { data: stats, refetch: refetchStats } = useGetSubmissionStats()

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      submission.teacher_id?.toLowerCase().includes(searchLower) ||
      submission.class_id?.toLowerCase().includes(searchLower) ||
      submission.subject_id?.toLowerCase().includes(searchLower)
    )
  })

  // Refresh stats when submissions change
  useEffect(() => {
    refetchStats()
  }, [submissions, refetchStats])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
          <p className="text-gray-600">
            Review and manage grade submissions from teachers
          </p>
        </div>

        <AdminResultsView
          submissions={filteredSubmissions}
          stats={stats}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
