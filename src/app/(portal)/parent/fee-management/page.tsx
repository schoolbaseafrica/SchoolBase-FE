"use client"

import { useParentStudents } from "../_components/student-provider"
import { StudentSelector } from "../_components/student-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ArrowDown, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  useGetStudentProfile,
  useGetStudentFeeDetails,
} from "../_hooks/use-parent-students"
import type { StudentFeeDetailsResponse } from "@/lib/fees"
import { EmptyState } from "@/components/results/empty-state"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function ParentFeeManagementPage() {
  const { selectedStudent } = useParentStudents()
  const { data: studentProfile, isLoading: isLoadingProfile } = useGetStudentProfile(
    selectedStudent?.id
  )

  // Try to get sessionId from student profile first (hook will fallback to active session if null)
  const sessionId = studentProfile?.academic_details?.id

  // Debug logging
  if (studentProfile && !sessionId) {
    console.warn(
      "[ParentFeeManagement] Student profile has no academic_details, will use active session fallback:",
      {
        studentId: selectedStudent?.id,
        academicDetails: studentProfile?.academic_details,
      }
    )
  }

  const {
    data: feeDetails,
    isLoading: isLoadingFees,
    error: feeDetailsError,
  } = useGetStudentFeeDetails(selectedStudent?.id, sessionId)

  // Log fee details errors
  if (feeDetailsError) {
    console.error("[ParentFeeManagement] Fee details error:", feeDetailsError)
  }

  // Determine if we have session information available
  // The hook will fetch active session as fallback, so we'll wait for that before showing "No Session"
  const waitingForSessionFallback = !sessionId && !feeDetailsError && isLoadingFees

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Fee Management</h1>
          <p className="text-gray-600">View and manage your child&apos;s school fees</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Please select a student to view fees</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLoading = isLoadingProfile || isLoadingFees

  // Extract details from response - use the same pattern as student portal
  // The hook returns ResponsePack<StudentFeeDetailsResponse>, so we need to access .data.data like student page does
  // Handle potential double-wrapping: ResponsePack<ResponsePack<StudentFeeDetailsResponse>> or ResponsePack<StudentFeeDetailsResponse>
  const details: StudentFeeDetailsResponse | undefined =
    (feeDetails as any)?.data?.data || feeDetails?.data || feeDetails

  // Comprehensive logging for debugging
  console.log("[ParentFeeManagement] Full state:", {
    selectedStudentId: selectedStudent?.id,
    sessionId,
    isLoadingProfile,
    isLoadingFees,
    hasFeeDetails: !!feeDetails,
    feeDetailsType: typeof feeDetails,
    feeDetailsKeys: feeDetails ? Object.keys(feeDetails) : [],
    feeDetailsStructure: feeDetails
      ? {
          status_code: (feeDetails as any)?.status_code,
          message: (feeDetails as any)?.message,
          hasData: !!(feeDetails as any)?.data,
          dataType: typeof (feeDetails as any)?.data,
          dataKeys: (feeDetails as any)?.data
            ? Object.keys((feeDetails as any).data)
            : [],
          dataHasData: !!(feeDetails as any)?.data?.data,
          dataDataKeys: (feeDetails as any)?.data?.data
            ? Object.keys((feeDetails as any).data.data)
            : [],
          // Log the actual data structure for inspection
          dataValue: (feeDetails as any)?.data
            ? JSON.parse(JSON.stringify((feeDetails as any).data))
            : null,
        }
      : null,
    hasDetails: !!details,
    detailsType: typeof details,
    detailsKeys: details ? Object.keys(details) : [],
    detailsStructure: details
      ? {
          hasStudentInfo: !!details.student_info,
          studentInfo: details.student_info
            ? JSON.parse(JSON.stringify(details.student_info))
            : null,
          hasFeeBreakdown: !!details.fee_breakdown,
          feeBreakdownLength: details.fee_breakdown?.length || 0,
          feeBreakdown: details.fee_breakdown
            ? JSON.parse(JSON.stringify(details.fee_breakdown))
            : null,
          hasPaymentHistory: !!details.payment_history,
          paymentHistoryLength: details.payment_history?.length || 0,
          paymentHistory: details.payment_history
            ? JSON.parse(JSON.stringify(details.payment_history))
            : null,
        }
      : null,
    extractionMethod: feeDetails
      ? {
          triedDataData: !!(feeDetails as any)?.data?.data,
          triedData: !!(feeDetails as any)?.data,
          triedDirect: !!feeDetails,
          finalSource: (feeDetails as any)?.data?.data
            ? "data.data"
            : (feeDetails as any)?.data
              ? "data"
              : "direct",
        }
      : null,
    feeDetailsError,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fee Management</h1>
          <p className="text-gray-600">View and manage your child&apos;s school fees</p>
        </div>
        <StudentSelector />
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
      ) : !waitingForSessionFallback && !sessionId && feeDetailsError ? (
        <EmptyState
          title="No Active Session"
          description="This student is not enrolled in an active academic session. Please contact the administrator."
          icon={DollarSign}
        />
      ) : !details ? (
        <EmptyState
          title="No Fee Information Available"
          description="No fee information is available for this student at this time."
          icon={DollarSign}
        />
      ) : (
        <div className="space-y-6">
          {/* Student Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                  {selectedStudent.photo_url ? (
                    <img
                      src={selectedStudent.photo_url}
                      alt={
                        details?.student_info?.first_name ||
                        selectedStudent.first_name ||
                        "Student"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">
                      {
                        (details?.student_info?.first_name ||
                          selectedStudent.first_name ||
                          "")[0]
                      }
                      {
                        (details?.student_info?.last_name ||
                          selectedStudent.last_name ||
                          "")[0]
                      }
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {details?.student_info?.first_name || selectedStudent.first_name}{" "}
                    {details?.student_info?.last_name || selectedStudent.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID:{" "}
                    {details?.student_info?.registration_number ||
                      selectedStudent.registration_number ||
                      "N/A"}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:justify-start">
                    {details?.student_info?.session && (
                      <span>Session: {details.student_info.session}</span>
                    )}
                    {details?.student_info?.class && (
                      <span>Class: {details.student_info.class}</span>
                    )}
                    {details?.student_info?.term && (
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
                    .reduce((acc, curr) => acc + curr.amount, 0)
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
                    .reduce((acc, curr) => acc + curr.amount_paid, 0)
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
                    .reduce((acc, curr) => acc + curr.outstanding_amount, 0)
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
                    {details.fee_breakdown.map((item, i) => (
                      <div key={i} className="grid grid-cols-4 items-center p-4 text-sm">
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
                    ))}
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
              {details?.payment_history && details.payment_history.length > 0 ? (
                <div className="space-y-4">
                  {details.payment_history.map((item, i) => (
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
                  ))}
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
