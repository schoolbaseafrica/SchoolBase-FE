"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StudentDetailsSheet from "./student-details-sheet"

import { FeePayment } from "@/lib/fees"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FeesTableProps {
  data: FeePayment[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

const FeesTable = ({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: FeesTableProps) => {
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleRowClick = (payment: FeePayment) => {
    setSelectedPayment(payment)
    setIsSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden w-full max-w-[calc(100vw-2rem)] overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:block lg:max-w-[calc(100vw-19rem)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-[0.96px] border-[#EAECF0] bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Student
                </TableHead>

                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Fee
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Amount Due
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Amount Paid
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Balance
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Method
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Date
                </TableHead>
                <TableHead className="font-outfit gap-[11.48px] px-[22.97px] py-[11.48px] text-[12px] leading-[18px] font-medium text-[#667085]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((payment) => {
                  const amountDue = parseFloat(payment.fee_component.amount)
                  const amountPaid = parseFloat(payment.amount_paid)
                  const balance = amountDue - amountPaid

                  return (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer border-b border-[#EAECF0] hover:bg-gray-50"
                      onClick={() => handleRowClick(payment)}
                    >
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                            {/* Avatar placeholder or image if available */}
                            <div className="flex h-full w-full items-center justify-center text-gray-500">
                              {payment.student.first_name[0]}
                              {payment.student.last_name[0]}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {payment.student.first_name} {payment.student.last_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {payment.invoice_number}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        {payment.fee_component.component_name}
                      </TableCell>
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        ₦{amountDue.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        ₦{amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        ₦{balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353] capitalize">
                        {payment.payment_method.replace("_", " ")}
                      </TableCell>
                      <TableCell className="font-outfit px-[22.97px] py-4 text-[14px] leading-none font-normal tracking-[0.005em] text-[#535353]">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-[22.97px] py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {data.map((payment) => {
            const amountDue = parseFloat(payment.fee_component.amount)
            const amountPaid = parseFloat(payment.amount_paid)
            const balance = amountDue - amountPaid

            return (
              <div
                key={payment.id}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300"
                onClick={() => handleRowClick(payment)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {payment.student.first_name} {payment.student.last_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Inv: {payment.invoice_number}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-4 flex flex-col">
                    <span className="text-xs text-gray-500">Fee</span>
                    <span className="mt-1 text-sm font-semibold text-gray-900">
                      {payment.fee_component.component_name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Due</span>
                      <span className="mt-1 text-sm font-semibold text-gray-900">
                        ₦{amountDue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col min-[400px]:text-center">
                      <span className="text-xs text-gray-500">Paid</span>
                      <span className="mt-1 text-sm font-semibold text-gray-900">
                        ₦{amountPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col text-left min-[400px]:text-right">
                      <span className="text-xs text-gray-500">Balance</span>
                      <span className="mt-1 text-sm font-semibold text-red-500">
                        ₦{balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-500">Total Payments: {total}</div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <StudentDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        student={selectedPayment}
      />
    </>
  )
}

export default FeesTable
