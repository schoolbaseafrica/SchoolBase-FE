"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetStudents } from "./_hooks/use-students"
import {
  useStudentsStore,
  selectFilteredStudents,
  selectPaginatedStudents,
} from "@/store/students-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"

export default function StudentsPage() {
  const { isLoading: isQueryLoading, isError, error } = useGetStudents()

  const { students, studentIds, filters } = useStudentsStore(
    useShallow((state) => ({
      students: state.students,
      studentIds: state.studentIds,
      filters: state.filters,
    }))
  )
  const setFilters = useStudentsStore((state) => state.setFilters)

  const filteredAll = useMemo(
    () => selectFilteredStudents(students, studentIds, filters),
    [students, studentIds, filters]
  )

  const paginatedStudents = useMemo(
    () => selectPaginatedStudents(filteredAll, filters.page, filters.limit),
    [filteredAll, filters.page, filters.limit]
  )

  const totalPages = Math.ceil(filteredAll.length / filters.limit)

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

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <UsersView
      isLoading={isQueryLoading && studentIds.length === 0}
      isError={isError}
      error={error?.message}
      users={paginatedStudents}
      userType="students"
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
