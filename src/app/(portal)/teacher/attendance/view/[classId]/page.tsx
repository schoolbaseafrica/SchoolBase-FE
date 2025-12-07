// FILE: src/app/(portal)/teacher/attendance/view/[classId]/page.tsx

"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, ArrowLeft, Calendar, Search } from "lucide-react"
import { useDailyAttendance } from "@/app/(portal)/admin/attendance/_hooks/use-attendance-admin"

const ViewAttendancePage = () => {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [search, setSearch] = useState("")

  const { data: attendanceData, isLoading } = useDailyAttendance(classId, selectedDate)

  const filteredStudents =
    attendanceData?.students.filter((s) =>
      `${s.first_name} ${s.middle_name || ""} ${s.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) || []

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800"
      case "ABSENT":
        return "bg-red-100 text-red-800"
      case "LATE":
        return "bg-yellow-100 text-yellow-800"
      case "EXCUSED":
        return "bg-blue-100 text-blue-800"
      case "HALF_DAY":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="px-5 pt-10">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <DashboardTitle
        heading="View Attendance"
        description="View attendance records for your class"
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-7"
            placeholder="Search student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {attendanceData?.summary && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {attendanceData.summary.total_students}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {attendanceData.summary.present_count}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {attendanceData.summary.absent_count}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Not Marked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-600">
                {attendanceData.summary.not_marked_count}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-500">Loading attendance data...</p>
        </div>
      )}

      {/* Attendance Table */}
      {!isLoading && (
        <Card className="mt-6">
          <CardContent className="p-0">
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S/N</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {student.first_name} {student.middle_name || ""}{" "}
                          {student.last_name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(student.status)}`}
                          >
                            {student.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>{student.check_in_time || "-"}</TableCell>
                        <TableCell>{student.check_out_time || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {student.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                {search
                  ? "No students match your search"
                  : "No attendance records found for this date"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ViewAttendancePage
