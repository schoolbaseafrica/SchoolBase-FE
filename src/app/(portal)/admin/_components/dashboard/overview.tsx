"use client"

import DashboardTitle from "@/components/dashboard/dashboard-title"
import StatCard, { StatItem } from "@/components/dashboard/stat-card"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import TodayActivities from "./today-activities-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Activity as ActivityIcon,
  Book,
  GraduationCap,
  Search,
  Users,
} from "lucide-react"
import { useTodayActivities } from "../../_hooks/today-activity"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import FeesReportChart from "./fees-report-chart"
import StudentGrowthChart from "./student-growth-chart"
import { useDashboardStore } from "@/store/dashboard-store"
import { useShallow } from "zustand/react/shallow"
// Import the Activity type
import { DashboardAPI, type Activity as DashboardActivity } from "@/lib/dashboard"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

const Overview = () => {
  const period = useAcademicPeriod("admin-dashboard")
  const { data: resolvedDashboard, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", "period-summary", period.sessionId],
    queryFn: () => DashboardAPI.resolve({ session_id: period.sessionId }),
    enabled: !!period.sessionId,
  })
  const metadata = resolvedDashboard?.data?.metadata
  const teacherTotal = metadata?.total_teachers ?? 0
  const studentTotal = metadata?.total_students ?? 0
  const parentTotal = metadata?.total_parents ?? 0
  // Fetch just count for classes
  const { data: classesData, isLoading: classLoading } = useGetClassesInfo({
    limit: 1,
    page: 1,
    session_id: period.sessionId,
  })

  // Sync activities to store
  const { isLoading: activitiesLoading } = useTodayActivities(period.sessionId)

  // Read activities from store
  const { todayActivities } = useDashboardStore(
    useShallow((state) => ({ todayActivities: state.todayActivities }))
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const classTotal = classesData?.pagination?.total ?? 0

  // Memoize activities array
  const activities = useMemo(() => {
    return todayActivities?.todays_activities ?? []
  }, [todayActivities])

  // Filter activities by search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities
    const term = searchTerm.toLowerCase()

    return activities.filter((act: DashboardActivity) => {
      const teacher = act?.teacher?.full_name?.toLowerCase() ?? ""
      const subject = act?.subject?.name?.toLowerCase() ?? ""
      const className = act?.class?.name?.toLowerCase() ?? ""

      return teacher.includes(term) || subject.includes(term) || className.includes(term)
    })
  }, [activities, searchTerm])

  const scrollToActivity = (index: number) => {
    if (index >= 5 && !showAll) setShowAll(true)
    setSearchTerm("")

    setTimeout(() => {
      const element = document.getElementById(`activity-${index}`)
      if (!element) return
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      setHighlightedIndex(index)
      setTimeout(() => setHighlightedIndex(null), 2000)
    }, 100)
  }

  function formatNumber(num: number) {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    return num.toString()
  }

  const formattedTeachers = summaryLoading ? "..." : formatNumber(teacherTotal)
  const formattedStudents = summaryLoading ? "..." : formatNumber(studentTotal)
  const formattedClass = classLoading ? "..." : formatNumber(classTotal)

  const isLoading =
    summaryLoading || classLoading || activitiesLoading || period.isLoading

  const dashboardStats: StatItem[] = useMemo(
    () => [
      {
        name: "Total Students",
        quantity: formattedStudents,
        percentage: 10,
        icon: GraduationCap,
      },
      {
        name: "Total Teachers",
        quantity: formattedTeachers,
        percentage: 10,
        icon: Users,
      },
      {
        name: "Total Parents",
        quantity: formatNumber(parentTotal),
        percentage: 10,
        icon: Users,
      },
      {
        name: "Total Classes",
        quantity: classLoading ? "..." : formattedClass,
        percentage: 10,
        icon: Book,
      },
    ],
    [classLoading, formattedTeachers, formattedStudents, formattedClass, parentTotal]
  )

  return (
    <div className="bg-[#FAFAFA] px-4 pt-4 sm:px-6 sm:pt-6">
      <DashboardTitle
        heading="Dashboard"
        description="Review school activity and performance for one consistent academic period"
      />
      <AcademicPeriodSelector scope="admin-dashboard" />

      <StatCard stats={dashboardStats} isLoading={isLoading} />

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudentGrowthChart />
        <FeesReportChart />
      </section>

      {/* Today's activities */}
      <section className="my-6 rounded-2xl border bg-white p-4 shadow-sm lg:p-6">
        <div className="mb-4 flex flex-col justify-between md:flex-row md:items-center">
          <div className="flex items-center gap-2 py-2.5">
            <ActivityIcon className="text-accent size-5" />
            <h2 className="text-primary text-2xl font-bold">Today&apos;s Activities</h2>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 lg:mt-0">
            {/* Search */}
            <aside className="relative w-full lg:max-w-[250px]">
              <div className="relative bg-[#D9D9D933]">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  type="search"
                  className="h-11 pl-8 md:h-10"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-[220px] min-h-[120px] w-full overflow-y-auto rounded-lg border bg-white shadow">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((act: DashboardActivity, i: number) => (
                      <button
                        key={act.schedule_id}
                        type="button"
                        onClick={() => scrollToActivity(i)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        {act?.teacher?.full_name} - {act?.subject?.name} (
                        {act?.class?.name})
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-500">No results found</p>
                  )}
                </div>
              )}
            </aside>

            <Button
              className="h-11 w-[137px] md:h-10"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less" : "View All"}
            </Button>
          </div>
        </div>

        <TodayActivities
          search={searchTerm}
          highlightedIndex={highlightedIndex}
          showAll={showAll}
          sessionId={period.sessionId}
        />
      </section>
    </div>
  )
}

export default Overview
