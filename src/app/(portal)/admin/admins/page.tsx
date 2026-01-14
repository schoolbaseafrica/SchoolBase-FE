"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetAdmins } from "./_hooks/use-admins"
import {
  useAdminsStore,
  selectFilteredAdmins,
  selectPaginatedAdmins,
} from "@/store/admins-store"
import { useShallow } from "zustand/react/shallow"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

export default function AdminsPage() {
  const router = useRouter()
  const { isLoading: isQueryLoading, isError, error } = useGetAdmins()

  const { admins, adminIds, filters } = useAdminsStore(
    useShallow((state) => ({
      admins: state.admins,
      adminIds: state.adminIds,
      filters: state.filters,
    }))
  )

  const setFilters = useAdminsStore((state) => state.setFilters)

  const filteredAll = useMemo(
    () => selectFilteredAdmins(admins, adminIds, filters),
    [admins, adminIds, filters]
  )

  const paginatedAdmins = useMemo(
    () => selectPaginatedAdmins(filteredAll, filters.page, filters.limit),
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

  const handleAddAdmin = () => {
    // Redirect to user configuration page with invite tab
    router.push("/admin/user-configuration?tab=invite")
  }

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <UsersView
      isLoading={isQueryLoading && adminIds.length === 0}
      isError={isError}
      error={error?.message}
      users={paginatedAdmins}
      userType="admins"
      searchQuery={filters.search}
      statusFilter={currentStatusFilter}
      currentPage={filters.page}
      totalPages={totalPages}
      onSearchChange={handleSearchChange}
      onStatusFilterChange={handleStatusFilterChange}
      onPageChange={handlePageChange}
      onAddUser={handleAddAdmin}
    />
  )
}
