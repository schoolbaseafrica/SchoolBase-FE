import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ArrowDown } from "lucide-react"
import { FeePayment } from "@/lib/fees"
import { useStudentFeeDetails } from "../_hooks/use-student-fee-details"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: FeePayment | null
}

const StudentDetailsSheet = ({
  open,
  onOpenChange,
  student,
}: StudentDetailsSheetProps) => {
  const { data, isLoading } = useStudentFeeDetails({
    studentId: student?.student_id,
    termId: student?.term_id,
    sessionId: student?.session_id,
  })

  const details = data?.data?.data

  if (!student) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto px-7 sm:max-w-[540px] xl:max-w-[30%]">
        <SheetHeader className="mb-6 flex flex-row items-center justify-between space-y-0 border-b border-gray-100 pb-4">
          <SheetTitle className="text-xl font-bold text-gray-900">
            Students Fees Details
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-8">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : details ? (
          <div className="space-y-8 pb-10">
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
                <span className="text-2xl font-bold text-gray-500">
                  {details.student_info.first_name[0]}
                  {details.student_info.last_name[0]}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {details.student_info.first_name} {details.student_info.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {details.student_info.registration_number}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:justify-start">
                  <span>Session: {details.student_info.session}</span>
                  <span>Class: {details.student_info.class}</span>
                  <span>Term: {details.student_info.term}</span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Total Fees</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  ₦
                  {details.fee_breakdown
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-green-200 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Total Paid</p>
                <p className="mt-1 text-sm font-bold text-green-500">
                  ₦
                  {details.fee_breakdown
                    .reduce((acc, curr) => acc + curr.amount_paid, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-red-200 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Unpaid</p>
                <p className="mt-1 text-sm font-bold text-red-500">
                  ₦
                  {details.fee_breakdown
                    .reduce((acc, curr) => acc + curr.outstanding_amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div>
              <h4 className="mb-4 text-lg font-bold text-gray-900">Payment Breakdown</h4>
              <div className="rounded-lg border border-gray-100">
                <div className="grid grid-cols-3 border-b border-gray-100 bg-white p-3 text-xs font-semibold text-gray-900">
                  <span>Fee</span>
                  <span className="text-center">Amount</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {details.fee_breakdown.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-4 text-sm">
                      <span className="text-gray-600">{item.component_name}</span>
                      <span className="text-center font-medium text-gray-900">
                        ₦{item.amount.toLocaleString()}
                      </span>
                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            item.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : item.status === "PARTIALLY_PAID"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="mb-4 text-lg font-bold text-gray-900">Payment History</h4>
              <div className="space-y-6">
                {details.payment_history.map((item, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <ArrowDown className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.fee_component}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.payment_date).toLocaleDateString()} via{" "}
                          {item.payment_method.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-500">
                      ₦{item.amount_paid.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No details found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default StudentDetailsSheet
