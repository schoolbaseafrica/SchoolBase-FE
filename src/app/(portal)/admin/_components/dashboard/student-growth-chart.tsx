"use client"

import { useMemo, useState } from "react"
import { GraduationCap } from "lucide-react"
import { TypedChartConfig } from "@/types/chart"
import { useStudentGrowthReport } from "../../students/_hooks/use-students"
import { useAdminAcademicPeriod } from "../../_hooks/use-admin-academic-period"
import { ReuseableBarChart } from "./bar-chart"

const studentConfig: TypedChartConfig<"newStudents" | "totalStudents"> = {
  newStudents: { label: "New enrollments", color: "#1EBE6F" },
  totalStudents: { label: "Total enrolled", color: "#D64545" },
}

export default function StudentGrowthChart() {
  const period = useAdminAcademicPeriod()
  const [interval, setInterval] = useState<"month" | "term">("month")
  const { data, isLoading } = useStudentGrowthReport(
    period.sessionId
      ? { session_id: period.sessionId, term_id: period.termId, interval }
      : undefined
  )

  const chartData = useMemo(
    () =>
      data?.report.map((item) => ({
        period: item.label,
        newStudents: item.new_students,
        totalStudents: item.cumulative_students,
      })) ?? [],
    [data]
  )

  return (
    <ReuseableBarChart
      title="Enrollment Growth"
      icon={GraduationCap}
      data={chartData}
      xKey="period"
      bars={["newStudents", "totalStudents"]}
      config={studentConfig}
      dropdown={[
        { label: "Monthly", value: "month" },
        { label: "By term", value: "term" },
      ]}
      onDropdownChange={(value) => setInterval(value as "month" | "term")}
      isLoading={isLoading || period.isLoading}
      footer={[
        { label: "New enrollments", color: "#1EBE6F" },
        { label: "Total enrolled", color: "#D64545" },
      ]}
      emptyText="No enrollments were recorded in this period."
    />
  )
}
