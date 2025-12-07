"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetParents } from "./_hooks/use-parents"
import { useState } from "react"

export default function ParentsPage() {
  const [currentPage, setCurrentPage] = useState<number>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const {
    data: parents,
    isLoading,
    isError,
    error,
  } = useGetParents({
    page: currentPage,
    search: searchQuery,
    is_active: statusFilter ? statusFilter === "active" : undefined,
  })

  return (
    <UsersView
      isLoading={isLoading}
      isError={isError}
      error={error?.message}
      users={parents || []}
      userType="parents"
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      currentPage={currentPage || 1}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      onPageChange={handlePageChange}
    />
  )
}
