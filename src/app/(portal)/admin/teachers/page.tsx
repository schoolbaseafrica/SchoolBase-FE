"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetTeachers } from "./_hooks/use-teachers"
import { useState } from "react"

export default function TeachersPage() {
  const [currentPage, setCurrentPage] = useState<number>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const {
    data: teachers,
    isLoading,
    isError,
    error,
    // refetch: refetchTeachers,
  } = useGetTeachers({
    page: currentPage,
    search: searchQuery,
    is_active: statusFilter ? statusFilter === "active" : undefined,
  })

  return (
    <UsersView
      isLoading={isLoading}
      isError={isError}
      error={error?.message}
      users={teachers || []}
      userType="teachers"
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      currentPage={currentPage || 1}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      onPageChange={handlePageChange}
    />
  )
}
