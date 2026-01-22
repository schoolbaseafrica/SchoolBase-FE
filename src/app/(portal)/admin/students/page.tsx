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

  // Always use server-side filtering for consistent behavior and to include unassigned students
  // When classId is undefined, we want all students (including unassigned)
  // When a specific class is selected, fetch all students in that class (use high limit)
  const {
    data: serverData,
    isLoading: isServerLoading,
    isError: isServerError,
    error: serverError,
  } = useGetStudentsWithMeta({
    page: filters.page,
    // When a class is selected, fetch all students in that class (use high limit)
    // When no class is selected, use normal pagination
    limit: filters.classId ? 10000 : filters.limit,
    search: filters.search || undefined,
    class_id: filters.classId || undefined, // undefined means "all classes" including unassigned
  })

  // Also fetch all students for client-side operations (bulk actions, etc.)
  const { isLoading: isClientLoading, isError: isClientError, error: clientError } = useGetStudents()

  const { students, studentIds } = useStudentsStore(
    useShallow((state) => ({
      students: state.students,
      studentIds: state.studentIds,
    }))
  )

  // Use server data (always server-side filtering now)
  const filteredAll = useMemo(() => {
    if (serverData?.data) {
      // Server-side filtering
      let filtered = serverData.data

      // Apply client-side status filter
      if (filters.isActive !== undefined) {
        filtered = filtered.filter((s) => s.is_active === filters.isActive)
      }

      return filtered
    } else {
      // Fallback to client-side if server data not available
      return selectFilteredStudents(students, studentIds, filters)
    }
  }, [serverData, students, studentIds, filters])

  // When a class is selected, show all students (no pagination)
  // When no class is selected, use server pagination
  const paginatedStudents = useMemo(() => {
    if (filters.classId) {
      // Class filter active: show all students (already fetched with high limit)
      return filteredAll
    } else {
      // No class filter: use server pagination
      return filteredAll
    }
  }, [filteredAll, filters.classId])

  // When a class is selected, there's only 1 page (all students shown)
  // When no class is selected, use server pagination
  const totalPages = filters.classId ? 1 : (serverData?.meta?.total_pages || 1)

  const isLoading = isServerLoading
  const isError = isServerError
  const error = serverError

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
