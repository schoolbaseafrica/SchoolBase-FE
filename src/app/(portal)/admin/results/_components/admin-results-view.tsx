"use client"

import { GradeSubmission } from "@/types/result"
import { SearchSection } from "./search-section"
import { StatsCards } from "./stats-cards"
import { SubmissionsGrid } from "./submissions-grid"

interface AdminResultsViewProps {
  submissions: GradeSubmission[]
  stats?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
  isLoading: boolean
}

export function AdminResultsView({
  submissions,
  stats,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  isLoading,
}: AdminResultsViewProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchSection
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
      />

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Submissions Grid */}
      <SubmissionsGrid submissions={submissions} isLoading={isLoading} />
    </div>
  )
}
