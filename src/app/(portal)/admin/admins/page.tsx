"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetAdminsPage } from "./_hooks/use-admins"
import { useAdminsStore } from "@/store/admins-store"
import { useShallow } from "zustand/react/shallow"
import { useRouter } from "next/navigation"

export default function AdminsPage() {
  const router = useRouter()
  const { filters } = useAdminsStore(
    useShallow((state) => ({
      filters: state.filters,
    }))
  )

  const setFilters = useAdminsStore((state) => state.setFilters)

  const admins = useGetAdminsPage({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    is_active: filters.isActive,
  })

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

  const handleAddAdmin = () => {
    // Redirect to user configuration page with invite tab
    router.push("/admin/user-configuration?tab=invite")
  }

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <UsersView
      isLoading={admins.isLoading}
      isError={admins.isError}
      error={admins.error?.message}
      users={admins.data?.data ?? []}
      userType="admins"
      searchQuery={filters.search}
      statusFilter={currentStatusFilter}
      currentPage={filters.page}
      pageSize={filters.limit}
      totalPages={admins.data?.total_pages ?? 1}
      totalItems={admins.data?.total ?? 0}
      onSearchChange={handleSearchChange}
      onStatusFilterChange={handleStatusFilterChange}
      onPageChange={handlePageChange}
      onAddUser={handleAddAdmin}
    />
  )
}
