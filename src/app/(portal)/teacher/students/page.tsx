"use client"

import React, { useState } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Loader2, AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetTeacherAssignedClasses } from "../attendance/_hooks/use-teacher-attendance"
import { ClassesAPI } from "@/lib/classes"
import { useQuery } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

interface Student {
  student_id: string
  registration_number: string
  name: string
  enrollment_date: string
  is_active: boolean
}

export default function TeacherStudentsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("")

  // Fetch assigned classes
  const {
    data: assignedClasses,
    isLoading: classesLoading,
    error: classesError,
  } = useGetTeacherAssignedClasses()

  // Fetch students for selected class
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["class-students", selectedClassId],
    queryFn: () => ClassesAPI.getStudentsForClass(selectedClassId),
    enabled: !!selectedClassId,
    select: (data) => data.data || [],
  })

  const students: Student[] = studentsData || []
  const isLoading = classesLoading

  // Ensure assignedClasses is an array
  const classesArray = Array.isArray(assignedClasses) ? assignedClasses : []
  const selectedClass = classesArray.find((cls) => cls.id === selectedClassId)

  return (
    <div className="px-5 pt-10">
      <DashboardTitle
        heading="Students"
        description="View students in your assigned classes"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-500">Loading classes...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && classesError && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your assigned classes. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !classesError && (
        <div className="mt-8 space-y-6">
          {/* Class Selector */}
          <div className="rounded-lg border bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Class
            </label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a class to view students" />
              </SelectTrigger>
              <SelectContent>
                {classesArray.length > 0 ? (
                  classesArray.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.arm}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-classes" disabled>
                    No classes assigned
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Students List */}
          {selectedClassId && (
            <div className="rounded-lg border bg-white">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Students in {selectedClass?.name} {selectedClass?.arm}
                </h2>
                <p className="text-sm text-gray-500">
                  {students.length} {students.length === 1 ? "student" : "students"}
                </p>
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading students...</span>
                </div>
              ) : studentsError ? (
                <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load students. Please try again.
                  </AlertDescription>
                </Alert>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Users className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-sm">
                    This class doesn't have any students assigned yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registration Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">
                            {student.registration_number}
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            {format(new Date(student.enrollment_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                student.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {student.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Empty State - No class selected */}
          {!selectedClassId && !classesLoading && (
            <div className="rounded-lg border border-dashed bg-gray-50 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">
                Select a class to view students
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Choose a class from the dropdown above to see the list of students.
              </p>
            </div>
          )}

          {/* Empty State - No classes assigned */}
          {!isLoading && classesArray.length === 0 && !classesError && (
            <div className="rounded-lg border border-dashed bg-gray-50 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">
                No classes assigned
              </p>
              <p className="mt-2 text-sm text-gray-400">
                You are not assigned as a teacher to any classes yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
