"use client"

import { useState, useMemo, useEffect } from "react"
import { GraduationCap } from "lucide-react"
import { ReuseableBarChart } from "./bar-chart" // adjust path
import { TypedChartConfig } from "@/types/chart"
import { useStudentGrowthReport } from "../../students/_hooks/use-students"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"

// -------------------
// Chart Configuration
// -------------------
const studentConfig: TypedChartConfig<"new" | "boys" | "girls"> = {
  new: { label: "New Students", color: "#1EBE6F" },
  boys: { label: "Boys", color: "#D64545" },
  girls: { label: "Girls", color: "#F4A300" },
}

// -------------------
// Component
// -------------------
export default function StudentGrowthChart() {
  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions()
  const [selectedYear, setSelectedYear] = useState<string>("")

  // Sort sessions: active first
  const sortedSessions = useMemo(() => {
    if (!sessionsData?.data) return []
    return [...sessionsData.data].sort(
      (a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)
    )
  }, [sessionsData])

  // Safe initial state
  useEffect(() => {
    if (!selectedYear && sortedSessions.length) {
      setSelectedYear(sortedSessions[0].name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedSessions])

  // useEffect(() => {
  //   if (!selectedYear && sortedSessions.length) {
  //     queueMicrotask(() => {
  //       setSelectedYear(sortedSessions[0].name)
  //     })
  //   }
  // }, [sortedSessions, selectedYear])

  const { data, isLoading: isLoadingGrowth } = useStudentGrowthReport(selectedYear)

  const chartData = useMemo(() => {
    if (!data?.report) return []
    return data.report.map((item) => ({
      class: item.class_name,
      new: item.new_students,
      boys: item.boys,
      girls: item.girls,
    }))
  }, [data])

  const handleYearChange = (value: string) => setSelectedYear(value)

  return (
    <ReuseableBarChart
      title="Student Growth"
      icon={GraduationCap}
      data={chartData}
      xKey="class"
      bars={["new", "boys", "girls"]}
      config={studentConfig}
      dropdown={sortedSessions.map((s) => ({ label: s.name, value: s.name }))}
      onDropdownChange={handleYearChange}
      isLoading={isLoadingGrowth || isLoadingSessions}
      footer={[
        { label: "New Students", color: "#1EBE6F" },
        { label: "Boys", color: "#D64545" },
        { label: "Girls", color: "#F4A300" },
      ]}
      emptyText="No student growth data for the selected year."
    />
  )
}
