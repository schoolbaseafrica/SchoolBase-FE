"use client"

import { useState } from "react"
import { useGetActivityLogs } from "./_hooks/use-activity-logs"
import { ActivityLogsTable } from "./_components/activity-logs-table"
import { ActivityLogsFilters } from "./_components/activity-logs-filters"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Pagination } from "@/components/ui/pagination"
import { ActivityAction } from "@/lib/activity-logs"

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [userFilter, setUserFilter] = useState<string>("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("")
  const [actionFilter, setActionFilter] = useState<ActivityAction | "">("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const { data, isLoading, isError, error } = useGetActivityLogs({
    page,
    limit,
    user_id: userFilter || undefined,
    entity_type: entityTypeFilter || undefined,
    action: actionFilter || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  })

  const logs = data?.data || []
  const pagination = data?.pagination

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleFiltersChange = (filters: {
    user?: string
    entityType?: string
    action?: ActivityAction | ""
    startDate?: string
    endDate?: string
  }) => {
    setUserFilter(filters.user || "")
    setEntityTypeFilter(filters.entityType || "")
    setActionFilter(filters.action || "")
    setStartDate(filters.startDate || "")
    setEndDate(filters.endDate || "")
    setPage(1) // Reset to page 1 when filters change
  }

  return (
    <div className="mx-auto p-4 sm:p-6">
      <DashboardTitle
        heading="Activity Log"
        description="Track user actions and changes across the system"
      />

      <ActivityLogsFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={{
          user: userFilter,
          entityType: entityTypeFilter,
          action: actionFilter,
          startDate,
          endDate,
        }}
      />

      <div className="mt-6">
        <ActivityLogsTable
          logs={logs}
          isLoading={isLoading}
          isError={isError}
          error={error?.message}
        />
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
          <Pagination
            itemName="logs"
            currentPage={page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
