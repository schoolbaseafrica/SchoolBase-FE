"use client"

import React, { useMemo, useState } from "react"
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
import { useFeesStore, selectFilteredFees } from "@/store/fees-store"
import { useShallow } from "zustand/react/shallow"
import { ItemLoader } from "../_components/sub-loader"
import {
  useAcademicSessions,
  useActiveAcademicSession,
} from "../class-management/session/_hooks/use-session"
import {
  useAcademicTermsForSession,
  useActiveAcademicTerm,
} from "../class-management/_hooks/use-academic-term"

const FeeManagement = () => {
  const { data: activeSession } = useActiveAcademicSession()
  const { data: activeTerm } = useActiveAcademicTerm()
  const { data: sessions } = useAcademicSessions({ limit: 100 })
  const [sessionId, setSessionId] = useState("")
  const [termId, setTermId] = useState("")
  const effectiveSessionId = sessionId || activeSession?.id || ""
  const effectiveTermId = termId || activeTerm?.id || "session"
  const { data: terms = [] } = useAcademicTermsForSession(effectiveSessionId || undefined)

  // 1. Fetch data
  const { isError, isLoading: isQueryLoading } = useGetFees({
    session_id: effectiveSessionId || undefined,
    term_id: effectiveTermId !== "session" ? effectiveTermId : undefined,
  })

  // 2. State & Actions
  const { fees, feeIds, filters } = useFeesStore(
    useShallow((state) => ({
      fees: state.fees,
      feeIds: state.feeIds,
      filters: state.filters,
    }))
  )
  const setFilters = useFeesStore((state) => state.setFilters)

  // 3. Derived State
  const filteredFees = useMemo(
    () => selectFilteredFees(fees, feeIds, filters),
    [fees, feeIds, filters]
  )

  const hasData = feeIds.length > 0

  // Note: Standard API query loading is usually sufficient, but store has isLoading too
  const isLoading = isQueryLoading && !hasData

  // Handlers
  const handleSearchChange = (val: string) => {
    setFilters({ search: val })
  }

  const handleStatusChange = (val: string) => {
    setFilters({ status: val === "all" ? undefined : val })
  }

  const currentStatus = filters.status || "all"

  return (
    <div className="w-full space-y-7 px-4 py-10 lg:px-8">
      {/* Title and Button */}
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <DashboardTitle
          heading="Fee Management"
          description="Create and manage fees for the selected academic period"
        />
        <CreateComponentButton>Add Fee</CreateComponentButton>
      </div>

      {isLoading ? (
        <ItemLoader item="Fees" />
      ) : isError ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-center text-red-500">Failed to load fees.</p>
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Search and Status */}
          <div className="grid w-full gap-3 md:grid-cols-[1fr_180px_180px_150px]">
            {/* Search Bar */}
            <div className="relative">
              <Search className="text-text-secondary absolute top-1/2 left-3 size-5 -translate-y-1/2" />
              <Input
                placeholder="Search by name or description"
                className="pl-10"
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Select
              value={effectiveSessionId}
              onValueChange={(value) => {
                setSessionId(value)
                setTermId("session")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {sessions?.data?.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                    {session.isActive ? " (Active)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={effectiveTermId} onValueChange={setTermId}>
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">Whole session</SelectItem>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                    {term.id === activeTerm?.id ? " (Active)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-full w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show filtered count */}
          {filters.search || filters.status ? (
            <div className="text-sm text-gray-500">
              Showing {filteredFees.length} of {feeIds.length} fees
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
