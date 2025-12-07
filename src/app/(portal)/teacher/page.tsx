"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { LiaListAltSolid } from "react-icons/lia"
import { GoChecklist } from "react-icons/go"
import { PiPawPrintFill } from "react-icons/pi"
import { CgFileDocument } from "react-icons/cg"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StatCard, { StatItem } from "@/components/dashboard/stat-card"
import TeacherWelcome from "./_components/teacher-welcome"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface ApiClass {
  id: string
  subject: string
  className: string
  date: string
  startTime: string
  endTime: string
  room?: string
}

interface ApiAssignment {
  id: string
  type: "Test" | "Assignment" | "Practical"
  subject: string
  topic: string
  className: string
  dueDate: string
  submitted?: boolean
}

interface ApiGradeSubmission {
  id: string
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

const homeworkBadgeStyles: Record<string, string> = {
  Test: "bg-[#E9FBF2] text-[#1F9254]",
  Assignment: "bg-[#FFF3E3] text-[#B4690E]",
  Practical: "bg-[#E7F1FF] text-[#1E63C3]",
}

const getSubjectImage = (subject: string): string => {
  const map: Record<string, string> = {
    Mathematics: `${assetBasePath}/mathematics-hero.png`,
    Physics: `${assetBasePath}/physics-hero.png`,
    Chemistry: `${assetBasePath}/chemistry-hero.png`,
    English: `${assetBasePath}/english-hero.png`,
  }
  return map[subject] || `${assetBasePath}/default-class.png`
}

export default function TeachersPage() {
  const [stats, setStats] = useState<StatItem[]>([
    { name: "Take Attendance", quantity: 0, percentage: 0, icon: LiaListAltSolid },
    { name: "Result", quantity: 0, percentage: 0, icon: GoChecklist },
    { name: "Class", quantity: 0, percentage: 0, icon: PiPawPrintFill },
    { name: "Assignment", quantity: 0, percentage: 0, icon: CgFileDocument },
  ])

  const [todaysClasses, setTodaysClasses] = useState<ApiClass[]>([])
  const [pendingHomework, setPendingHomework] = useState<ApiAssignment[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [classesRes, assignmentsRes, gradesRes] = await Promise.all([
          api.get<ApiClass[]>("/classes/teacher/assigned"),
          api.get<ApiAssignment[]>("/assignments"),
          api.get<ApiGradeSubmission[]>("/grades/submissions"),
        ])

        const allClasses = classesRes.data ?? []
        const allAssignments = assignmentsRes.data ?? []
        const gradeSubmissions = gradesRes.data ?? []

        const today = new Date().toISOString().split("T")[0]
        const todayClasses = allClasses.filter((cls) => cls.date === today)

        const pending = allAssignments
          .filter((a) => {
            const due = a.dueDate.split("T")[0]
            return due >= today && !a.submitted
          })
          .slice(0, 4)

        setStats([
          {
            name: "Take Attendance",
            quantity: todayClasses.length,
            percentage: 10,
            icon: LiaListAltSolid,
          },
          {
            name: "Result",
            quantity: gradeSubmissions.length,
            percentage: 10,
            icon: GoChecklist,
          },
          {
            name: "Class",
            quantity: allClasses.length,
            percentage: 10,
            icon: PiPawPrintFill,
          },
          {
            name: "Assignment",
            quantity: allAssignments.length,
            percentage: 10,
            icon: CgFileDocument,
          },
        ])

        setTodaysClasses(todayClasses)
        setPendingHomework(pending)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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

          {todaysClasses.length === 0 ? (
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
                    <Button
                      variant="outline"
                      className="w-[172px] rounded-lg border-[#DA3743] text-base font-medium text-[#DA3743]"
                    >
                      View Class
                    </Button>
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

          {pendingHomework.length === 0 ? (
            <p className="py-10 text-center text-[#535353]">No pending homework</p>
          ) : (
            <div className="space-y-4 lg:hidden">
              {pendingHomework.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E0E0E0] bg-[#FFFFFF] p-4 shadow-[0px_8px_24px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "rounded-full px-4 py-1 text-sm font-medium",
                        homeworkBadgeStyles[item.type] ?? "bg-[#F2F4F7] text-[#475467]"
                      )}
                    >
                      {item.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg border border-[#DA3743] px-4 text-sm font-medium text-[#DA3743]"
                    >
                      View
                    </Button>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm text-[#535353]">
                    <div className="flex justify-between">
                      <dt className="font-medium text-[#2D2D2D]">Subject</dt>
                      <dd>{item.subject}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-[#2D2D2D]">Topic</dt>
                      <dd>{item.topic}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-[#2D2D2D]">Class</dt>
                      <dd>{item.className}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-[#2D2D2D]">Due Date</dt>
                      <dd>
                        {new Date(item.dueDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
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
