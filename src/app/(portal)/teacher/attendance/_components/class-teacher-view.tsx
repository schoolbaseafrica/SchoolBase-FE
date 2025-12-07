"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen, Users, Calendar, ClipboardCheck, Eye } from "lucide-react"
import { TeacherAssignedClass } from "@/lib/teacher-attendance"
import { useRouter } from "next/navigation"

interface ClassTeacherViewProps {
  assignedClasses: TeacherAssignedClass[]
  selectedSessionId?: string
  onSessionChange: (sessionId: string | undefined) => void
}

const ClassTeacherView: React.FC<ClassTeacherViewProps> = ({
  assignedClasses,
  // selectedSessionId,
  // onSessionChange,
}) => {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string>("")

  // Set initial class when data loads
  React.useEffect(() => {
    if (assignedClasses && assignedClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(assignedClasses[0].id)
    }
  }, [assignedClasses, selectedClassId])

  const selectedClass = assignedClasses?.find((cls) => cls.id === selectedClassId)

  if (!assignedClasses || assignedClasses.length === 0) {
    return null
  }

  const handleMarkAttendance = () => {
    if (selectedClassId) {
      router.push(`/teacher/attendance/mark/${selectedClassId}`)
    }
  }

  const handleViewAttendance = () => {
    if (selectedClassId) {
      router.push(`/teacher/attendance/view/${selectedClassId}`)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Class Teacher Dashboard
        </CardTitle>
        <CardDescription className="text-sm">
          Manage attendance for your assigned{" "}
          {assignedClasses.length === 1 ? "class" : "classes"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Class Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Your Class
            {assignedClasses.length > 1 && (
              <span className="ml-2 text-xs text-gray-500">
                ({assignedClasses.length} classes assigned)
              </span>
            )}
          </label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {assignedClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cls.name}</span>
                    {cls.arm && (
                      <span className="text-sm text-gray-500">• {cls.arm}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class Details Card */}
        {selectedClass && (
          <div className="rounded-lg border-2 border-purple-100 bg-linear-to-br from-purple-50 to-white p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClass.name}
                    {selectedClass.arm && (
                      <span className="ml-2 text-purple-600">• {selectedClass.arm}</span>
                    )}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{selectedClass.academicSession.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedClass.teacherIds.length} Teacher
                        {selectedClass.teacherIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={handleMarkAttendance}
              disabled={!selectedClassId}
              className="w-full"
              size="lg"
            >
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Mark Attendance
            </Button>
            <Button
              onClick={handleViewAttendance}
              disabled={!selectedClassId}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              View Attendance
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Class Teacher Responsibilities
              </p>
              <p className="mt-1 text-xs text-blue-700">
                As a class teacher, you can mark daily attendance for students in your
                assigned class and view historical attendance records.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats (Optional - can be enabled if you have this data) */}
        {/* <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">32</p>
            <p className="text-xs text-gray-600">Total Students</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">28</p>
            <p className="text-xs text-gray-600">Present Today</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-600">4</p>
            <p className="text-xs text-gray-600">Absent Today</p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}

export default ClassTeacherView
