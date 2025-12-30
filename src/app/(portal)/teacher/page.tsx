"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LiaListAltSolid } from "react-icons/lia"
import { GoChecklist } from "react-icons/go"
import { PiPawPrintFill } from "react-icons/pi"
import { CgFileDocument } from "react-icons/cg"
import { Button } from "@/components/ui/button"
import StatCard, { StatItem } from "@/components/dashboard/stat-card"
import TeacherWelcome from "./_components/teacher-welcome"
import { useTeacherDashboard } from "./_hooks/use-teacher-dashboard"
import { TeacherAttendanceAPI } from "@/lib/teacher-attendance"
import { useQuery } from "@tanstack/react-query"

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface DisplayClass {
  id: string
  classId: string
  subject: string
  className: string
  startTime: string
  endTime: string
  room?: string
}

// ──────────────────────────────────────────────────────────────
// Skeleton Components
// ──────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-[#CCCCCC] bg-white">
    <div className="h-[196px] w-full rounded-t-2xl bg-gray-200" />
    <div className="space-y-4 p-6">
      <div className="h-8 w-3/4 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
      <div className="h-10 w-40 rounded-lg bg-gray-200" />
    </div>
  </div>
)

const SkeletonHomeworkItem = () => (
  <div className="animate-pulse rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div className="h-8 w-20 rounded-full bg-gray-200" />
      <div className="h-9 w-20 rounded-lg bg-gray-200" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
)

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

const assetBasePath = "/assets/dashboard/teacher"

const getSubjectImage = (subject: string): string => {
  const map: Record<string, string> = {
    Mathematics: `${assetBasePath}/mathematics-hero.png`,
    Physics: `${assetBasePath}/physics-hero.png`,
    Chemistry: `${assetBasePath}/chemistry-hero.png`,
    English: `${assetBasePath}/english-hero.png`,
  }
  // Use mathematics-hero as default fallback since default-class.png doesn't exist
  return map[subject] || `${assetBasePath}/mathematics-hero.png`
}

export default function TeachersPage() {
  const router = useRouter()

  // Fetch today's classes from dashboard API
  const {
    data: todaysClassesData,
    isLoading: isLoadingClasses,
    error: classesError,
    refetch: refetchClasses,
  } = useTeacherDashboard()

  // Fetch all assigned classes for stats
  const { data: assignedClasses, isLoading: isLoadingAssignedClasses } = useQuery({
    queryKey: ["teacher-assigned-classes"],
    queryFn: () => TeacherAttendanceAPI.getAssignedClasses(),
    staleTime: 1000 * 60 * 5,
  })

  // Transform today's classes to display format
  // Note: All classes in todaysClassesData are classes the teacher is scheduled to teach
  // The backend now checks both class_teachers table AND schedules, so we show the button for all
  const todaysClasses: DisplayClass[] = useMemo(() => {
    if (!todaysClassesData?.todays_classes) return []

    return todaysClassesData.todays_classes.map((cls) => ({
      id: cls.schedule_id,
      classId: cls.class_id,
      subject: cls.subject_name,
      className: cls.class_name,
      startTime: cls.start_time.substring(0, 5), // Extract HH:MM from HH:MM:SS
      endTime: cls.end_time.substring(0, 5),
      room: cls.room?.name,
    }))
  }, [todaysClassesData])

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const todaysClassesCount = todaysClasses.length
    const totalClassesCount = assignedClasses?.length || 0

    return [
      {
        name: "Take Attendance",
        quantity: todaysClassesCount,
        percentage: 10,
        icon: LiaListAltSolid,
      },
      {
        name: "Result",
        quantity: 0, // TODO: Add grades/result count when API is available
        percentage: 10,
        icon: GoChecklist,
      },
      {
        name: "Class",
        quantity: totalClassesCount,
        percentage: 10,
        icon: PiPawPrintFill,
      },
      {
        name: "Assignment",
        quantity: 0, // TODO: Add assignment count when API is available
        percentage: 10,
        icon: CgFileDocument,
      },
    ]
  }, [todaysClasses.length, assignedClasses?.length])

  const loading = isLoadingClasses || isLoadingAssignedClasses

  // ──────────────────────────────────────────────────────────────
  // Loading Skeleton
  // ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <section className="min-h-screen bg-[#FAFAFA] px-4 py-10 text-[#2D2D2D] sm:px-8">
        <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-8 pb-16">
          {/* Welcome Skeleton */}
          <div className="h-48 w-full animate-pulse rounded-2xl bg-gray-200" />

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-[#CCCCCC] bg-white p-4"
              >
                <div className="mb-3 h-6 w-6 rounded bg-gray-200" />
                <div className="h-8 w-20 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Today’s Classes Skeleton */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 rounded bg-gray-200" />
              <div className="h-10 w-28 rounded-lg bg-gray-200" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </section>

          {/* Pending Homework Skeleton */}
          <section className="rounded-2xl border border-[#E8E8E8] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="h-8 w-56 rounded bg-gray-200" />
              <div className="h-10 w-28 rounded-lg bg-gray-200" />
            </div>
            <div className="space-y-4">
              <SkeletonHomeworkItem />
              <SkeletonHomeworkItem />
            </div>
          </section>

          {/* Bottom Cards Skeleton */}
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#CDCDCD] bg-white p-6">
              <div className="mb-6 h-8 w-64 rounded bg-gray-200" />
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="size-12 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-full rounded bg-gray-200" />
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#CDCDCD] bg-white p-6">
              <div className="mb-6 h-8 w-72 rounded bg-gray-200" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-[#F6F6F6] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-gray-200" />
                      <div className="h-5 w-32 rounded bg-gray-200" />
                    </div>
                    <div className="h-6 w-20 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    )
  }

  // ──────────────────────────────────────────────────────────────
  // Real Content (unchanged)
  // ──────────────────────────────────────────────────────────────

  return (
    <section className="min-h-screen bg-[#FAFAFA] px-4 py-10 text-[#2D2D2D] sm:px-8">
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-8 pb-16">
        <TeacherWelcome />
        <StatCard stats={stats} />

        {/* Today’s Classes */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-medium text-[#2D2D2D]">Today’s Classes</h2>
            <Button
              variant="ghost"
              size="sm"
              className="group flex h-10 items-center gap-2 rounded-lg border border-[#D5D5D5] px-6 text-base font-medium text-[#535353]"
            >
              View All
            </Button>
          </div>

          {classesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
              <p className="mb-2 text-lg font-semibold text-red-600">
                Failed to load today's classes
              </p>
              <p className="mb-4 text-sm text-red-500">
                {classesError instanceof Error
                  ? classesError.message
                  : "An error occurred"}
              </p>
              <Button
                onClick={() => refetchClasses()}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          ) : todaysClasses.length === 0 ? (
            <div className="rounded-2xl border border-[#CCCCCC] bg-white p-12 text-center">
              <p className="text-lg text-[#535353]">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {todaysClasses.map((cls) => (
                <article
                  key={cls.id}
                  className="flex h-full flex-col rounded-2xl border border-[#CCCCCC] bg-white"
                >
                  <div className="relative h-[196px] w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={getSubjectImage(cls.subject)}
                      alt={`${cls.subject} classroom`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-2xl leading-7 font-medium">{cls.subject}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[15px] text-[#535353]">
                        <span>Class: {cls.className}</span>
                        <span className="hidden h-4 w-px bg-[#595959]/70 sm:block" />
                        <span>
                          {cls.startTime} - {cls.endTime}
                        </span>
                        {cls.room && (
                          <>
                            <span className="hidden h-4 w-px bg-[#595959]/70 sm:block" />
                            <span>{cls.room}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-lg border-[#DA3743] text-base font-medium text-[#DA3743]"
                        onClick={() =>
                          router.push(`/teacher/attendance/view/${cls.classId}`)
                        }
                      >
                        View Attendance
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-lg border-[#DA3743] text-base font-medium text-[#DA3743]"
                        onClick={() => router.push(`/teacher/classroom/${cls.classId}`)}
                      >
                        Open Classroom
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pending Homework */}
        <section className="rounded-2xl border border-[#E8E8E8] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[#2D2D2D]">Pending Homework</h2>
            <Button
              variant="ghost"
              size="sm"
              className="group flex h-10 items-center gap-2 rounded-lg border border-[#D5D5D5] px-6 text-base font-medium text-[#535353]"
            >
              View All
            </Button>
          </div>

          <p className="py-10 text-center text-[#535353]">
            Assignment functionality coming soon
          </p>
        </section>

        {/* Notifications + Performance */}
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#CDCDCD] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#2D2D2D]">
              Recent Notifications
            </h2>
            <div className="mt-6">
              <p className="text-[#6F6F6F]">No new notifications</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#CDCDCD] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#2D2D2D]">
              Class Performance Summary
            </h2>
            <div className="mt-6">
              <p className="text-[#6F6F6F]">
                Performance data will appear once results are processed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
