"use client"

import { Wallet } from "lucide-react"
import { ReuseableBarChart } from "../dashboard/bar-chart"

import { TypedChartConfig } from "@/types/chart"

// -------------------
// Chart Data
// -------------------
const feeData = [
  { month: "Jun", paid: 0, unpaid: 0 },
  { month: "Jul", paid: 0, unpaid: 0 },
  { month: "Aug", paid: 0, unpaid: 0 },
  { month: "Sep", paid: 0, unpaid: 0 },
  { month: "Oct", paid: 0, unpaid: 0 },
  { month: "Nov", paid: 0, unpaid: 0 },
]

// -------------------
// Chart Config
// -------------------
const feeConfig: TypedChartConfig<"paid" | "unpaid"> = {
  paid: { label: "Paid", color: "#10B981" },
  unpaid: { label: "Unpaid", color: "#EF4444" },
}

// -------------------
// Component
// -------------------
export default function FeesReportChart() {
  return (
    <ReuseableBarChart
      title="Fees Management"
      icon={Wallet}
      data={feeData}
      xKey="month"
      bars={["paid", "unpaid"]}
      config={feeConfig}
      footer={[
        { label: "Paid", color: "#10B981" },
        { label: "Unpaid", color: "#EF4444" },
      ]}
    />
  )
}
