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
  const {
    data: studentProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetStudentProfile(student?.id)
  const {
    data: attendance,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useGetMonthlyAttendance(student?.registration_number)
  const {
    data: latestResult,
    isLoading: isLoadingResult,
    error: resultError,
  } = useGetLatestResult(student?.id)

  // Log errors and data for debugging
  if (profileError) console.error("Dashboard: Profile error:", profileError)
  if (attendanceError) console.error("Dashboard: Attendance error:", attendanceError)
  if (resultError) console.error("Dashboard: Result error:", resultError)
  if (studentProfile)
    console.log("Dashboard: Student profile data:", {
      hasClassDetails: !!studentProfile.class_details,
      classDetails: studentProfile.class_details,
      hasAcademicDetails: !!studentProfile.academic_details,
      academicDetails: studentProfile.academic_details,
    })

  // Calculate attendance percentage - guard against division by zero
  const attendancePercentage =
    attendance && attendance.total_days_in_month > 0
      ? Math.round((attendance.days_present / attendance.total_days_in_month) * 100)
      : null

  // Get session from academic details or latest result
  const sessionName =
    studentProfile?.academic_details?.session ||
    latestResult?.academic_session_name ||
    null

  // Get term from latest result
  const termName = latestResult?.term_name || null

  const isLoading = isLoadingProfile || isLoadingAttendance || isLoadingResult

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-2 text-2xl font-semibold">
        Welcome, {userTitle} {user?.first_name}
      </h1>
      <p className="mb-6 text-gray-600">Here is your child&apos;s academic report</p>

      <div className="mb-6 flex items-center justify-between space-x-6">
        <StudentSelector />

        <div className="flex flex-col items-center space-x-4">
          <div>
            <Image
              src={student?.photo_url || "/assets/images/parent.png"}
              alt={studentName || "Student"}
              width={70}
              height={70}
              className="h-20 w-20 rounded-full object-cover"
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
        <div className="min-h-[195px] rounded-xl bg-white p-4 shadow">
          <div className="lg:flex lg:justify-between">
            <div className="">
              <h2 className="text-primary text-lg font-semibold">
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
                    <p className="text-primary">
                      <span className="font-bold">Term:</span> {termName}
                    </p>
                  )}
                  {sessionName && (
                    <p className="text-primary">
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
              <p className="text-primary">Overall Grade</p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="link" className="text-accent mt-2 text-sm">
              <Link href="/parent/results">View Full Result →</Link>
            </Button>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="min-h-[195px] rounded-xl bg-white p-4 shadow">
          <h2 className="text-primary text-lg font-semibold">Attendance Summary</h2>

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
                <span className="text-primary">Present</span>
              </p>
              {/* absent days */}
              <p className="flex flex-col items-center justify-center">
                <span className="text-accent text-[40px] leading-none font-medium">
                  {attendance.days_absent}
                </span>
                <span className="text-primary">Absent Days</span>
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <p className="text-gray-500">No attendance data available</p>
            </div>
          )}
          <div className="flex justify-center">
            <Button variant="link" className="text-accent mt-2 text-sm">
              <Link href="/parent/attendance">View Attendance Calendar →</Link>
            </Button>
          </div>
        </div>

        {/* School Fees */}
        <div className="min-h-[195px] space-y-[31px] rounded-xl bg-white p-4 shadow">
          <div className="flex justify-between">
            <div className="space-x-2">
              <h2 className="text-primary text-lg leading-5 font-semibold">
                School Fees
              </h2>
              {termName && (
                <p className="text-primary">
                  <span className="font-bold">Term:</span> {termName}
                </p>
              )}
              {sessionName && (
                <p className="text-primary">
                  <span className="font-bold">Session:</span> {sessionName}
                </p>
              )}
            </div>
          </div>

          {/* amount */}
          <div className="space-y-[15px]">
            <p className="text-primary text-sm text-gray-600">
              View detailed fee information and payment history
            </p>
          </div>
          <Button className="w-full">
            <Link href="/parent/fee-management">View Fee Management →</Link>
          </Button>
        </div>

        {/* Upcoming Events */}
        <div className="min-h-[195px] space-y-6 rounded-xl bg-white p-4 shadow">
          <h2 className="text-primary text-2xl font-semibold">Upcoming Events</h2>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No upcoming events at this time</p>
          </div>
        </div>
      </section>
    </div>
  )
}
