"use client"

import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardTitle } from "@/components/ui/card"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Banknote } from "lucide-react"
import { useFeesAnalytics } from "../../fees-record/_hooks/use-fees-analytics"
import { Skeleton } from "@/components/ui/skeleton"

// ✅ REQUIRED: ChartContainer config
const chartConfig = {
  paid: { label: "Paid", color: "#00A878" },
  unpaid: { label: "Unpaid", color: "#D64545" },
}

const FeesReportChart = () => {
  const { data: analyticsData, isLoading } = useFeesAnalytics()
  const totals = analyticsData?.data?.data?.totals

  // Use real data from API, fallback to 0 if not available
  const paid = totals?.total_paid || 0
  const unpaid = totals?.outstanding_balance || 0
  const total = paid + unpaid

  const chartData = [
    { name: "Paid", value: paid, fill: "#00A878" },
    { name: "Unpaid", value: unpaid, fill: "#D64545" },
  ]

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-accent">
            <Banknote />
          </span>
          Fees Report
        </CardTitle>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[260px] w-[260px] rounded-full" />
          <div className="mt-2 flex w-full justify-between">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-accent">
          <Banknote />
        </span>
        Fees Report
      </CardTitle>

      <CardContent className="flex flex-col items-center">
        {total > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="aspect-square w-[260px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />

                <Pie
                  data={chartData}
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={0}
                  stroke="white"
                  strokeWidth={4}
                  dataKey="value"
                  nameKey="name"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null

                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-semibold"
                          >
                            Total
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy && viewBox.cy + 22}
                            className="fill-foreground text-2xl font-bold"
                          >
                            ₦{(total / 1_000_000).toFixed(0)}M
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Text labels left and right */}
            <div className="mt-2 flex w-full justify-between">
              <div className="flex flex-col items-start">
                <span className="text-muted-foreground text-sm">Paid</span>
                <span className="font-semibold text-green-600">
                  ₦{(paid / 1_000_000).toFixed(1)}M
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-sm">Unpaid</span>
                <span className="font-semibold text-red-500">
                  ₦{(unpaid / 1_000_000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00A878]" />
                Paid
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D64545]" />
                Unpaid
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[260px] w-full flex-col items-center justify-center text-center text-gray-500">
            <Banknote className="mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm">No fees data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FeesReportChart
