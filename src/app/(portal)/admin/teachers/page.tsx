"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetTeachersPage } from "./_hooks/use-teachers"
import { useTeachersStore } from "@/store/teachers-store"
import { useShallow } from "zustand/react/shallow"

export default function TeachersPage() {
  const { filters } = useTeachersStore(
    useShallow((state) => ({
      filters: state.filters,
    }))
  )
  const setFilters = useTeachersStore((state) => state.setFilters)
  const teachers = useGetTeachersPage({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    is_active: filters.isActive,
  })

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
      isLoading={teachers.isLoading}
      isError={teachers.isError}
      error={teachers.error?.message}
      users={teachers.data?.data ?? []}
      userType="teachers"
      searchQuery={filters.search}
      statusFilter={currentStatusFilter}
      currentPage={filters.page}
      pageSize={filters.limit}
      totalPages={teachers.data?.total_pages ?? 1}
      totalItems={teachers.data?.total ?? 0}
      onSearchChange={handleSearchChange}
      onStatusFilterChange={handleStatusFilterChange}
      onPageChange={handlePageChange}
    />
  )
}
