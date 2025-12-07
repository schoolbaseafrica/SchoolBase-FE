"use client"

import React, { useState, useMemo } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import CreateComponentButton from "./_components/create-component-button"
import FeeComponentTable from "./_components/fee-component-table"
import FeeComponentGrid from "./_components/fee-component-grid"
import EmptyState from "./_components/empty-state"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import { useGetFees } from "./_hooks/use-fees"

const FeeManagement = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: feeData, isLoading, isError } = useGetFees({ page: 1, limit: 20 })
  // console.log("FEES FROM BACKEND:", feeData)
  // Extract fees array - handle null case AND nested data structure
  // const fees = feeData?.data?.fees || []

  const fees = useMemo(() => {
    return feeData?.data?.fees || []
  }, [feeData])

  // Filter fees based on search and status using useMemo for performance
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesSearch =
        fee.component_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || fee.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [fees, searchQuery, statusFilter])

  const hasData = fees.length > 0

  return (
    <div className="w-full space-y-7 px-4 py-10 lg:px-8">
      {/* Title and Button */}
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <DashboardTitle
          heading="Fee Management"
          description="Create and manage different fees"
        />
        <CreateComponentButton>Add Fee</CreateComponentButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-center text-gray-500">Loading fees...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-center text-red-500">Failed to load fees.</p>
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Search and Status */}
          <div className="grid w-full grid-cols-[85fr_15fr] gap-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="text-text-secondary absolute top-1/2 left-3 size-5 -translate-y-1/2" />
              <Input
                placeholder="Search by name or description"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-full w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show filtered count */}
          {searchQuery || statusFilter !== "all" ? (
            <div className="text-sm text-gray-500">
              Showing {filteredFees.length} of {fees.length} fees
            </div>
          ) : null}

          {/* Desktop Table - Hidden on mobile */}
          <FeeComponentTable feeComponents={filteredFees} />

          {/* Mobile Grid - Visible only on mobile */}
          <FeeComponentGrid feeComponents={filteredFees} />

          {/* No results message */}
          {filteredFees.length === 0 && hasData && (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500">No fees match your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FeeManagement
