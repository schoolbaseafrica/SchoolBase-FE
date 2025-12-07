"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import StatsCards from "./_components/stats-cards"
import FeesChart from "./_components/fees-chart"
import FeesFilters from "./_components/fees-filters"
import FeesTable from "./_components/fees-table"
import { useFeePayments } from "./_hooks/use-fee-payments"
import { FeePaymentParams } from "@/lib/fees"

const FeesRecord = () => {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Partial<FeePaymentParams>>({})

  const { data: paymentsData, isLoading } = useFeePayments({
    page,
    limit: 10,
    ...filters,
  })

  const payments = paymentsData?.data?.payments || []
  const totalPages = paymentsData?.data
    ? Math.ceil(paymentsData.data.total / paymentsData.data.limit)
    : 1

  const handleFilterChange = useCallback((newFilters: Partial<FeePaymentParams>) => {
    setFilters(newFilters)
    setPage(1) // Reset to page 1 on filter change
  }, [])

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <DashboardTitle
            heading="Fees Dashboard"
            description="Overview of student fee collections for the current academic year"
          />
          <div className="flex w-full gap-3 md:w-auto">
            {/* <Button
              variant="outline"
              className="flex-1 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 md:flex-none"
            >
              <Upload className="mr-2 h-4 w-4" />
              Export Records
            </Button> */}
            <Link href="/admin/fees-record/add-payment">
              <Button className="flex-1 bg-[#DA3743] hover:bg-[#DA3743]/90 md:flex-none">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Chart */}
        <FeesChart />

        {/* Filters and Table */}
        <div className="space-y-6">
          <FeesFilters onFilterChange={handleFilterChange} />
          <FeesTable
            data={payments}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            total={paymentsData?.data?.total || 0}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}

export default FeesRecord
