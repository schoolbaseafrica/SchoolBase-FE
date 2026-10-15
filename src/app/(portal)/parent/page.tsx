"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { useParentStudents } from "./_components/student-provider"
import {
  useGetStudentProfile,
  useGetMonthlyAttendance,
  useGetLatestResult,
} from "./_hooks/use-parent-students"
import { StudentSelector } from "./_components/student-selector"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParentDashboard() {
  const user = useAuthStore((state) => state.user)
  const userTitle = user?.title ? `${user.title}.` : ""
  const { selectedStudent: student } = useParentStudents()
  const studentName = student && `${student.first_name} ${student.last_name}.`

  // Fetch real data
  const { data: studentProfile, isLoading: isLoadingProfile } = useGetStudentProfile(
    student?.id
  )
  const { data: attendance, isLoading: isLoadingAttendance } = useGetMonthlyAttendance(
    student?.registration_number
  )
  const { data: latestResult, isLoading: isLoadingResult } = useGetLatestResult(
    student?.id
  )

  // Calculate attendance percentage - guard against division by zero
  const attendancePercentage =
    attendance && attendance.total_days_in_month > 0
      ? Math.round((attendance.days_present / attendance.total_days_in_month) * 100)
      : null

  // Get session from academic details or latest result
  const sessionName =
    studentProfile?.academic_details?.session ||
    (latestResult as { academic_session_name?: string })?.academic_session_name ||
    null

  // Get term from latest result
  const termName = (latestResult as { term_name?: string })?.term_name || null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-2 text-2xl font-semibold">
        Welcome, {userTitle} {user?.first_name}
      </h1>
      <p className="mb-6 text-gray-600">Here is your child&apos;s academic report</p>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
        <StudentSelector />

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <Image
              src={student?.photo_url || "/assets/images/parent.png"}
              alt={studentName || "Student"}
              width={70}
              height={70}
              className="h-14 w-14 rounded-full object-cover"
              unoptimized={
                student?.photo_url?.startsWith("http://") ||
                student?.photo_url?.startsWith("https://")
              }
            />
          </div>
          <div>
            <p className="font-semibold">{studentName}</p>
            <div className="text-gray-500">
              {isLoadingProfile ? (
                <Skeleton className="h-4 w-20" />
              ) : studentProfile ? (
                studentProfile.class_details?.name ? (
                  <span>{studentProfile.class_details.name}</span>
                ) : (
                  <span className="text-gray-400">Not assigned to a class</span>
                )
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Academic Summary */}
        <div className="min-h-[195px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="lg:flex lg:justify-between">
            <div className="">
              <h2 className="text-lg font-semibold text-slate-900">
                Academic Result Summary
              </h2>
              {isLoadingResult ? (
                <>
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : latestResult || studentProfile?.academic_details ? (
                <>
                  {termName && (
                    <p className="text-sm text-slate-600">
                      <span className="font-bold">Term:</span> {termName}
                    </p>
                  )}
                  {sessionName && (
                    <p className="text-sm text-slate-600">
                      <span className="font-bold">Session:</span> {sessionName}
                    </p>
                  )}
                </>
              ) : null}
            </div>
            {/* grade */}
            <div className="text-center">
              {isLoadingResult ? (
                <Skeleton className="mx-auto mb-2 h-12 w-12" />
              ) : (
                <p className="text-[40px] font-medium text-green-600">
                  {latestResult?.grade_letter || (
                    <span className="text-sm text-gray-400">No grade yet</span>
                  )}
                </p>
              )}
              <p className="text-sm text-slate-500">Overall Grade</p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/parent/results">View full result →</Link>
            </Button>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="min-h-[195px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attendance Summary</h2>

          {isLoadingAttendance ? (
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </div>
          ) : attendance ? (
            <div className="mt-4 flex justify-between">
              {/* present days */}
              <p className="flex flex-col items-center justify-center lg:px-16">
                <span className="text-[40px] leading-none text-[#10B981]">
                  {attendancePercentage !== null ? `${attendancePercentage}%` : "N/A"}
                </span>
                <span className="text-sm text-slate-500">Present</span>
              </p>
              {/* absent days */}
              <p className="flex flex-col items-center justify-center">
                <span className="text-[40px] leading-none font-medium text-slate-800">
                  {attendance.days_absent}
                </span>
                <span className="text-sm text-slate-500">Absent Days</span>
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <p className="text-gray-500">No attendance data available</p>
            </div>
          )}
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/parent/attendance">View attendance calendar →</Link>
            </Button>
          </div>
        </div>

        {/* School Fees */}
        <div className="min-h-[195px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <div className="space-x-2">
              <h2 className="text-lg font-semibold text-slate-900">School Fees</h2>
              {termName && (
                <p className="text-sm text-slate-600">
                  <span className="font-bold">Term:</span> {termName}
                </p>
              )}
              {sessionName && (
                <p className="text-sm text-slate-600">
                  <span className="font-bold">Session:</span> {sessionName}
                </p>
              )}
            </div>
          </div>

          {/* amount */}
          <div className="mt-5">
            <p className="text-sm text-slate-600">
              View detailed fee information and payment history
            </p>
          </div>
          <Button asChild size="sm" className="mt-5 rounded-full px-5">
            <Link href="/parent/fee-management">View fees →</Link>
          </Button>
        </div>

        {/* Upcoming Events */}
        <div className="min-h-[195px] space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No upcoming events at this time</p>
          </div>
        </div>
      </section>
    </div>
  )
}
