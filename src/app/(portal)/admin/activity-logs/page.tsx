"use client"

import { useState, useEffect } from "react"
import { useGetActivityLogs } from "./_hooks/use-activity-logs"
import { ActivityLogsTable } from "./_components/activity-logs-table"
import { ActivityLogsFilters } from "./_components/activity-logs-filters"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Pagination } from "@/components/ui/pagination"
import { ActivityAction } from "@/lib/activity-logs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [userFilter, setUserFilter] = useState<string>("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<ActivityAction | "all">("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Construct params object to ensure proper query key serialization
  const queryParams = {
    page,
    limit,
    ...(userFilter && { user_id: userFilter }),
    ...(entityTypeFilter !== "all" && { entity_type: entityTypeFilter }),
    ...(actionFilter !== "all" && { action: actionFilter }),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  }

  const { data, isLoading, isError, error } = useGetActivityLogs(queryParams)

  const logs = data?.data || []
  const pagination = data?.pagination

  // Scroll to top only after new data has loaded (not immediately on page change)
  useEffect(() => {
    if (!isLoading && logs.length > 0 && page > 1) {
      // Scroll to top smoothly after data has loaded
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [isLoading, logs.length, page])

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) {
      setPage(newPage)
    }
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit))
    setPage(1) // Reset to page 1 when limit changes
  }

  const handleFiltersChange = (filters: {
    user?: string
    entityType?: string
    action?: ActivityAction | "all"
    startDate?: string
    endDate?: string
  }) => {
    setUserFilter(filters.user || "")
    setEntityTypeFilter(filters.entityType || "all")
    setActionFilter(filters.action || "all")
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

      {pagination && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm text-muted-foreground">
              Rows per page:
            </Label>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger id="rows-per-page" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pagination.total_pages > 1 && (
            <Pagination
              itemName="logs"
              currentPage={pagination.page || page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  )
}
