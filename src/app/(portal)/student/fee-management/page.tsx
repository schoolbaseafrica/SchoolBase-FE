"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ArrowDown, Clock } from "lucide-react"
import { EmptyState } from "@/components/results/empty-state"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useGetStudentFeeDetails } from "../_hooks/use-student-fees"
import { useStudentAuth } from "@/hooks/use-auth-user"
import { useQuery } from "@tanstack/react-query"
import { getActiveTerm } from "@/lib/results"
import type { StudentFeeDetailsResponse } from "@/lib/fees"

export default function StudentFeeManagementPage() {
  const { studentId } = useStudentAuth()

  // Get active term
  const { data: activeTerm, isLoading: isLoadingTerm } = useQuery({
    queryKey: ["active-term"],
    queryFn: () => getActiveTerm(),
    staleTime: 1000 * 60 * 5,
  })

  // Session ID will be fetched automatically from student profile
  const {
    data: feeDetails,
    isLoading: isLoadingFees,
    error: feeError,
  } = useGetStudentFeeDetails(
    studentId,
    activeTerm?.id,
    undefined // sessionId will be fetched from student profile automatically
  )

  // Log errors for debugging
  if (feeError) {
    console.error("Student Fee Details Error:", feeError)
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Fee Management</h1>
          <p className="text-gray-600">View your school fees and payment history</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Student information not available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLoading = isLoadingTerm || isLoadingFees
  // The hook returns ResponsePack<StudentFeeDetailsResponse>, so we need to access .data.data like parent page does
  // Handle potential double-wrapping: ResponsePack<ResponsePack<StudentFeeDetailsResponse>> or ResponsePack<StudentFeeDetailsResponse>
  const details: StudentFeeDetailsResponse | undefined =
    (feeDetails as any)?.data?.data || feeDetails?.data || feeDetails

  // Debug logging to see the actual response structure and hook state
  console.log("Student Fee Management State:", {
    studentId,
    activeTermId: activeTerm?.id,
    isLoadingTerm,
    isLoadingFees,
    feeError,
    feeDetails: feeDetails
      ? {
          status_code: feeDetails.status_code,
          message: feeDetails.message,
          hasData: !!feeDetails.data,
          dataKeys: feeDetails.data ? Object.keys(feeDetails.data) : [],
        }
      : null,
    details: details
      ? {
          hasStudentInfo: !!details.student_info,
          feeBreakdownLength: details.fee_breakdown?.length || 0,
          paymentHistoryLength: details.payment_history?.length || 0,
          feeBreakdown: details.fee_breakdown,
          paymentHistory: details.payment_history,
          studentInfo: details.student_info,
        }
      : null,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Fee Management</h1>
        <p className="text-gray-600">View your school fees and payment history</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : !activeTerm?.id ? (
        <EmptyState
          title="No Active Term"
          description="There is no active academic term at this time. Please contact the administrator."
          icon={DollarSign}
        />
      ) : !details ? (
        <EmptyState
          title="No Fee Information Available"
          description="No fee information is available for you at this time."
          icon={DollarSign}
        />
      ) : (
        <div className="space-y-6">
          {/* Student Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                  {details.student_info?.first_name ? (
                    <span className="text-2xl font-bold text-gray-500">
                      {details.student_info.first_name[0]}
                      {details.student_info.last_name?.[0] || ""}
                    </span>
                  ) : (
                    <DollarSign className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {details.student_info?.first_name} {details.student_info?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {details.student_info?.registration_number}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:justify-start">
                    {details.student_info?.session && (
                      <span>Session: {details.student_info.session}</span>
                    )}
                    {details.student_info?.class && (
                      <span>Class: {details.student_info.class}</span>
                    )}
                    {details.student_info?.term && (
                      <span>Term: {details.student_info.term}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">
                  ₦
                  {(details?.fee_breakdown || [])
                    .reduce((acc: number, curr) => acc + curr.amount, 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ₦
                  {(details?.fee_breakdown || [])
                    .reduce((acc: number, curr) => acc + curr.amount_paid, 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  ₦
                  {(details?.fee_breakdown || [])
                    .reduce((acc: number, curr) => acc + curr.outstanding_amount, 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {details?.fee_breakdown && details.fee_breakdown.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50 p-4 text-xs font-semibold text-gray-900 md:text-sm">
                    <span>Fee Component</span>
                    <span className="text-center">Amount</span>
                    <span className="text-center">Paid</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {details.fee_breakdown.map(
                      (
                        item: StudentFeeDetailsResponse["fee_breakdown"][0],
                        i: number
                      ) => (
                        <div
                          key={i}
                          className="grid grid-cols-4 items-center p-4 text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {item.component_name}
                          </span>
                          <span className="text-center text-gray-900">
                            ₦{item.amount.toLocaleString()}
                          </span>
                          <span className="text-center text-gray-600">
                            ₦{item.amount_paid.toLocaleString()}
                          </span>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                item.status === "PAID"
                                  ? "border-green-300 bg-green-100 text-green-700"
                                  : item.status === "PARTIALLY_PAID"
                                    ? "border-orange-300 bg-orange-100 text-orange-700"
                                    : "border-red-300 bg-red-100 text-red-700"
                              }
                            >
                              {item.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">
                  No fee components assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {details?.payment_history &&
              Array.isArray(details.payment_history) &&
              details.payment_history.length > 0 ? (
                <div className="space-y-4">
                  {details.payment_history.map(
                    (
                      item: StudentFeeDetailsResponse["payment_history"][0],
                      i: number
                    ) => (
                      <div
                        key={i}
                        className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <ArrowDown className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.fee_component}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.term_label} •{" "}
                              {format(new Date(item.payment_date), "MMM dd, yyyy")}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Ref: {item.transaction_reference}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ₦{item.amount_paid.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.payment_method}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No payment history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
