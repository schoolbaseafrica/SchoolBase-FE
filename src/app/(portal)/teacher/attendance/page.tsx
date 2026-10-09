"use client"

import React from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import ManualCheckInCard from "./_components/manual-checkin-card"
import ClassTeacherView from "./_components/class-teacher-view"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  useGetTeacherAssignedClasses,
  useGetTodayCheckInStatus,
} from "./_hooks/use-teacher-attendance"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

const TeacherAttendance = () => {
  const period = useAcademicPeriod("teacher-attendance")

  // Fetch assigned classes
  const {
    data: assignedClasses,
    isLoading: classesLoading,
    error: classesError,
  } = useGetTeacherAssignedClasses(period.sessionId)

  // Fetch today's check-in status
  const { data: checkInStatus, isLoading: statusLoading } = useGetTodayCheckInStatus()

  const hasCheckedIn = checkInStatus?.has_attendance || false
  const hasPendingRequest = checkInStatus?.has_pending_request || false
  const isClassTeacher = assignedClasses && assignedClasses.length > 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <DashboardTitle
        heading="Attendance"
        description="Take student attendance and record your own check-in"
      />
      <AcademicPeriodSelector scope="teacher-attendance" sessionOnly />

      <section aria-label="Student attendance">
        {classesLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading assigned classes…
          </div>
        ) : classesError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>Could not load your assigned classes.</AlertDescription>
          </Alert>
        ) : isClassTeacher ? (
          <ClassTeacherView assignedClasses={assignedClasses} />
        ) : (
          <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
            You have no assigned class in this session.
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="my-attendance-heading">
        <div>
          <h2 id="my-attendance-heading" className="text-xl font-semibold">
            My attendance
          </h2>
          <p className="text-muted-foreground text-sm">
            Record your own attendance for today.
          </p>
        </div>
        {statusLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading your check-in…
          </div>
        ) : (
          <ManualCheckInCard
            hasCheckedIn={hasCheckedIn}
            hasPendingRequest={hasPendingRequest}
          />
        )}
      </section>
    </div>
  )
}

export default TeacherAttendance
