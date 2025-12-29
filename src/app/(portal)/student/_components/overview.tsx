"use client"

import React, { useMemo } from "react"
import {
  LucideIcon,
  GraduationCap,
  Book,
  Check,
  Table,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useStudentDashboard } from "../_hooks/use-student-dashboard"
import { formatTime, getSubjectIcon } from "./dashboard/todays-timetable"
import { StatsCards } from "./dashboard/stats-cards"
import { TodaysTimetable } from "./dashboard/todays-timetable"
import { AssignmentsList } from "./dashboard/assignments-list"
import { PerformanceOverview } from "./dashboard/performance-overview"
import { AnnouncementsList } from "./dashboard/announcements-list"
import { Button } from "@/components/ui/button"

// Type definitions
interface Stat {
  label: string
  value: string
  icon: LucideIcon
}

interface Assignment {
  title: string
  subject: string
  dueDate: string
  status: string
}

const Overview = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
    isRefetching,
    attendancePercent,
    isAttendanceLoading,
  } = useStudentDashboard()

  // Transform API data to component format
  const schedule = useMemo(() => {
    if (!dashboardData?.todays_timetable) return []
    return dashboardData.todays_timetable.map((item) => ({
      subject: item.subject_name,
      time: `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`,
      room: item.room?.name || "TBD",
      icon: getSubjectIcon(item.subject_name),
      Teacher: item.teacher_name || "TBD",
    }))
  }, [dashboardData])

  // Stats derived from real data
  const stats: Stat[] = useMemo(() => {
    const classCount = schedule.length
    const announcementsCount = dashboardData?.announcements?.length || 0
    const assignmentsCount = 0 // TODO: Add assignments API
    const attendanceDisplay = isAttendanceLoading
      ? "Loading..."
      : attendancePercent !== undefined
        ? `${attendancePercent}%`
        : "N/A"

    return [
      {
        label: "Today's Class",
        value: String(classCount),
        icon: GraduationCap,
      },
      {
        label: "Pending Assignments",
        value: String(assignmentsCount),
        icon: Book,
      },
      {
        label: "Attendance",
        value: attendanceDisplay,
        icon: Check,
      },
      {
        label: "Announcements",
        value: String(announcementsCount),
        icon: Table,
      },
    ]
  }, [
    schedule.length,
    dashboardData?.announcements?.length,
    attendancePercent,
    isAttendanceLoading,
  ])

  // Dummy data for assignments (TODO: Replace with real API)
  const assignments: Assignment[] = []

  // Error state with retry
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-600">
            Failed to load dashboard data
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4"
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header with Refresh */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
              disabled={isRefetching}
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Today's Timetable */}
              <TodaysTimetable schedule={schedule} isLoading={isLoading} />

              {/* Assignments */}
              <AssignmentsList assignments={assignments} isLoading={false} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <PerformanceOverview
                results={dashboardData?.latest_results}
                metadata={dashboardData?.metadata}
                isLoading={isLoading}
              />

              {/* Announcements */}
              <AnnouncementsList
                announcements={dashboardData?.announcements || []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Overview
