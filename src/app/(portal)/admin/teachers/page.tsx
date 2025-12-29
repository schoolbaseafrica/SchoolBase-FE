"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetTeachers } from "./_hooks/use-teachers"
import {
  useTeachersStore,
  selectFilteredTeachers,
  selectPaginatedTeachers,
} from "@/store/teachers-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"

export default function TeachersPage() {
  // 1. Fetch data (background sync)
  const { isLoading: isQueryLoading, isError, error, data: queryData } = useGetTeachers()

  // 2. Get state from store (optimized selectors)
  const { teachers, teacherIds, filters } = useTeachersStore(
    useShallow((state) => ({
      teachers: state.teachers,
      teacherIds: state.teacherIds,
      filters: state.filters,
    }))
  )

  // Debug logging
  console.log("TeachersPage: Render state", {
    isLoading: isQueryLoading,
    isError,
    error: error?.message,
    queryDataLength: queryData?.length,
    storeTeacherCount: teacherIds.length,
    storeTeachers: Object.keys(teachers).length,
    filters,
  })
  const setFilters = useTeachersStore((state) => state.setFilters)

  // 3. Compute derived state (memoized)
  const filteredAll = useMemo(
    () => selectFilteredTeachers(teachers, teacherIds, filters),
    [teachers, teacherIds, filters]
  )

  const paginatedTeachers = useMemo(
    () => selectPaginatedTeachers(filteredAll, filters.page, filters.limit),
    [filteredAll, filters.page, filters.limit]
  )

  const totalPages = Math.ceil(filteredAll.length / filters.limit)

  // Handlers
  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search, page: 1 }) // Reset to page 1 on search
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      isActive: status === "active" ? true : status === "inactive" ? false : undefined,
      page: 1,
    })
  }

  // Map store filter to UI string
  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <UsersView
      isLoading={isQueryLoading && teacherIds.length === 0} // Only show loading if no data found yet
      isError={isError}
      error={error?.message}
      users={paginatedTeachers}
      userType="teachers"
      searchQuery={filters.search}
      statusFilter={currentStatusFilter}
      currentPage={filters.page}
      totalPages={totalPages}
      onSearchChange={handleSearchChange}
      onStatusFilterChange={handleStatusFilterChange}
      onPageChange={handlePageChange}
    />
  )
}
