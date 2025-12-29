"use client"

import React, { useState } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import ManualCheckInCard from "./_components/manual-checkin-card"
import ClassTeacherView from "./_components/class-teacher-view"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  useGetTeacherAssignedClasses,
  useGetTodayCheckInStatus,
} from "./_hooks/use-teacher-attendance"

const TeacherAttendance = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    undefined
  )

  // Fetch assigned classes
  const {
    data: assignedClasses,
    isLoading: classesLoading,
    error: classesError,
  } = useGetTeacherAssignedClasses(selectedSessionId)

  // Fetch today's check-in status
  const { data: checkInStatus, isLoading: statusLoading } = useGetTodayCheckInStatus()

  const isLoading = classesLoading || statusLoading
  const hasCheckedIn = checkInStatus?.has_attendance || false
  const isClassTeacher = assignedClasses && assignedClasses.length > 0

  return (
    <div className="px-5 pt-10">
      <DashboardTitle
        heading="Attendance"
        description="Manage your attendance and view your assigned classes"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-500">Loading attendance information...</p>
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

      {/* Check-in Status Banner */}
      {!isLoading && hasCheckedIn && checkInStatus?.check_in_time && (
        <Alert className="mt-5 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✓ You have checked in today at{" "}
            {new Date(checkInStatus.check_in_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !classesError && (
        <div className="mt-8 space-y-6">
          {/* Manual Check-in Card - Always shown */}
          <ManualCheckInCard hasCheckedIn={hasCheckedIn} />

          {/* Class Teacher View - Only if assigned as class teacher */}
          {isClassTeacher && (
            <ClassTeacherView
              assignedClasses={assignedClasses}
              selectedSessionId={selectedSessionId}
              onSessionChange={setSelectedSessionId}
            />
          )}

          {/* No Classes Message */}
          {!isClassTeacher && !hasCheckedIn && (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <p className="text-gray-500">
                You are not assigned as a class teacher for any class.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Please check in manually above to mark your attendance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance
