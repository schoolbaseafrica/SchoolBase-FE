"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetStudents, useGetStudentsWithMeta } from "./_hooks/use-students"
import {
  useStudentsStore,
  selectFilteredStudents,
  selectPaginatedStudents,
} from "@/store/students-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"
import { BulkActionsMenu } from "./_components/bulk-actions-menu"
import { ClassFilter } from "./_components/class-filter"

export default function StudentsPage() {
  const { filters } = useStudentsStore(
    useShallow((state) => ({
      filters: state.filters,
    }))
  )
  const setFilters = useStudentsStore((state) => state.setFilters)

  // Use server-side filtering when class_id is selected, otherwise use client-side filtering
  const shouldUseServerFilter = !!filters.classId
  
  // Server-side filtered query
  const {
    data: serverData,
    isLoading: isServerLoading,
    isError: isServerError,
    error: serverError,
  } = useGetStudentsWithMeta(
    shouldUseServerFilter
      ? {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          class_id: filters.classId || undefined,
        }
      : undefined
  )

  // Client-side filtered query (when no class filter)
  const { isLoading: isClientLoading, isError: isClientError, error: clientError } = useGetStudents()

  const { students, studentIds } = useStudentsStore(
    useShallow((state) => ({
      students: state.students,
      studentIds: state.studentIds,
    }))
  )

  // Use server data when class filter is active, otherwise use client-side filtering
  const filteredAll = useMemo(() => {
    if (shouldUseServerFilter && serverData?.data) {
      // Server-side filtering
      let filtered = serverData.data

      // Apply client-side status filter
      if (filters.isActive !== undefined) {
        filtered = filtered.filter((s) => s.is_active === filters.isActive)
      }

      return filtered
    } else {
      // Client-side filtering
      return selectFilteredStudents(students, studentIds, filters)
    }
  }, [shouldUseServerFilter, serverData, students, studentIds, filters])

  const paginatedStudents = useMemo(() => {
    if (shouldUseServerFilter) {
      // Server already paginated, return as-is
      return filteredAll
    } else {
      // Client-side pagination
      return selectPaginatedStudents(filteredAll, filters.page, filters.limit)
    }
  }, [shouldUseServerFilter, filteredAll, filters.page, filters.limit])

  const totalPages = shouldUseServerFilter
    ? serverData?.meta?.total_pages || 1
    : Math.ceil(filteredAll.length / filters.limit)

  const isLoading = shouldUseServerFilter ? isServerLoading : isClientLoading && studentIds.length === 0
  const isError = shouldUseServerFilter ? isServerError : isClientError
  const error = shouldUseServerFilter ? serverError : clientError

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search, page: 1 })
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      isActive: status === "active" ? true : status === "inactive" ? false : undefined,
      page: 1,
    })
  }

  const handleClassFilterChange = (classId: string | undefined) => {
    setFilters({ classId, page: 1 })
  }

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <div className="mx-auto p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <BulkActionsMenu />
      </div>

      <div className="mb-4">
        <ClassFilter
          value={filters.classId}
          onValueChange={handleClassFilterChange}
        />
      </div>

      <UsersView
        isLoading={isLoading}
        isError={isError}
        error={error?.message}
        users={paginatedStudents}
        userType="students"
        searchQuery={filters.search}
        statusFilter={currentStatusFilter}
        currentPage={filters.page}
        totalPages={totalPages}
        pageSize={filters.limit}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
