"use client"

import { useParentStudents } from "../_components/student-provider"
import { useGetMonthlyAttendance } from "../_hooks/use-parent-students"
import { StudentSelector } from "../_components/student-selector"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"

export default function ParentAttendancePage() {
  const { selectedStudent } = useParentStudents()
  const { data: attendance, isLoading } = useGetMonthlyAttendance(
    selectedStudent?.registration_number
  )

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-gray-600">View your child&apos;s attendance records</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Please select a student to view attendance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-gray-600">View your child&apos;s attendance records</p>
        </div>
        <StudentSelector />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : attendance ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Present Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {attendance.days_present}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Absent Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {attendance.days_absent}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Late Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {attendance.days_late}
                </div>
                <p className="text-xs text-gray-500">
                  out of {attendance.total_days_in_month}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {attendance.total_days_in_month > 0
                    ? `${Math.round((attendance.days_present / attendance.total_days_in_month) * 100)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500">
                  for {attendance.month} {attendance.year}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Attendance Details - {attendance.month} {attendance.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.attendance_details &&
              attendance.attendance_details.length > 0 ? (
                <div className="space-y-2">
                  {attendance.attendance_details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            detail.status === "PRESENT"
                              ? "bg-green-500"
                              : detail.status === "ABSENT"
                                ? "bg-red-500"
                                : detail.status === "LATE"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium">
                            {format(new Date(detail.date), "EEEE, MMMM d, yyyy")}
                          </p>
                          {detail.check_in_time && (
                            <p className="text-sm text-gray-500">
                              Check-in:{" "}
                              {format(new Date(detail.check_in_time), "hh:mm a")}
                            </p>
                          )}
                          {detail.notes && (
                            <p className="text-sm text-gray-500">{detail.notes}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          detail.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : detail.status === "ABSENT"
                              ? "bg-red-100 text-red-700"
                              : detail.status === "LATE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {detail.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-gray-500">
                  No attendance records available for this month
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">No attendance data available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
