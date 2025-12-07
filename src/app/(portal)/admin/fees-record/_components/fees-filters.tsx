"use client"

import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTerms } from "../../class-management/_hooks/use-academic-term"
import { useDebounce } from "@/hooks/use-debounce"
import { FeePaymentParams } from "@/lib/fees"

interface FeesFiltersProps {
  onFilterChange: (filters: Partial<FeePaymentParams>) => void
}

const FeesFilters = ({ onFilterChange }: FeesFiltersProps) => {
  const [search, setSearch] = useState("")
  const [sessionId, setSessionId] = useState("all")
  const [termId, setTermId] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [status, setStatus] = useState("all")
  const [method, setMethod] = useState("all")

  const debouncedSearch = useDebounce(search, 500)

  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  const { data: termsData } = useAcademicTerms({ limit: 100 })

  useEffect(() => {
    const filters: Partial<FeePaymentParams> = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (sessionId && sessionId !== "all") filters.session_id = sessionId
    if (termId && termId !== "all") filters.term_id = termId
    if (classFilter && classFilter !== "all") filters.class = classFilter
    if (status && status !== "all") filters.status = status
    if (method && method !== "all") filters.payment_method = method

    onFilterChange(filters)
  }, [debouncedSearch, sessionId, termId, classFilter, status, method, onFilterChange])

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      <div className="relative w-full xl:w-auto xl:min-w-[300px] xl:flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by Student name, Invoice..."
          className="font-outfit pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:flex-nowrap">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="font-outfit w-full border-red-500 text-red-500 sm:flex-1 xl:w-[140px] xl:flex-none">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            {sessionsData?.data?.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="font-outfit w-full sm:flex-1 xl:w-[130px] xl:flex-none">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="JSS1">JSS1</SelectItem>
            <SelectItem value="JSS2">JSS2</SelectItem>
            <SelectItem value="JSS3">JSS3</SelectItem>
            <SelectItem value="SSS1">SSS1</SelectItem>
            <SelectItem value="SSS2">SSS2</SelectItem>
            <SelectItem value="SSS3">SSS3</SelectItem>
          </SelectContent>
        </Select>

        <Select value={termId} onValueChange={setTermId}>
          <SelectTrigger className="font-outfit w-full sm:flex-1 xl:w-[130px] xl:flex-none">
            <SelectValue placeholder="All Terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {termsData?.data?.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="font-outfit w-full sm:flex-1 xl:w-[140px] xl:flex-none">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="font-outfit w-full sm:flex-1 xl:w-[130px] xl:flex-none">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default FeesFilters
