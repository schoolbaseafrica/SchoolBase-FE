"use client"

import { UsersView } from "@/components/users/users-view"
import { useGetStudents } from "./_hooks/use-students"
import { useState } from "react"

export default function StudentsPage() {
  const [currentPage, setCurrentPage] = useState<number>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const {
    data: students,
    isLoading,
    isError,
    error,
  } = useGetStudents({
    page: currentPage,
    search: searchQuery,
    // is_active: statusFilter ? statusFilter === "active" : undefined,
  })

  return (
    <UsersView
      isLoading={isLoading}
      isError={isError}
      error={error?.message}
      users={students || []}
      userType="students"
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      currentPage={currentPage || 1}
      onSearchChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      onPageChange={handlePageChange}
    />
  )
}
