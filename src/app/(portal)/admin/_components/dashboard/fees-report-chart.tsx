"use client"

import { Pie, PieChart, Label } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Banknote } from "lucide-react"

const chartData = [
  { name: "Paid", value: 8600000, fill: "#00A878" },
  { name: "Unpaid", value: 4600000, fill: "#D64545" },
]

// ✅ REQUIRED: ChartContainer config
const chartConfig = {
  paid: { label: "Paid", color: "#00A878" },
  unpaid: { label: "Unpaid", color: "#D64545" },
}

const FeesReportChart = () => {
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-accent">
            <Banknote />
          </span>
          Fees Report
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <ChartContainer config={chartConfig} className="aspect-square w-[260px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

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
              ₦{(chartData[0].value / 1_000_000).toFixed(1)}M
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-sm">Unpaid</span>
            <span className="font-semibold text-red-500">
              ₦{(chartData[1].value / 1_000_000).toFixed(1)}M
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
      </CardContent>
    </Card>
  )
}

export default FeesReportChart
