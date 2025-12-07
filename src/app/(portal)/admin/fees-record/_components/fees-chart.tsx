"use client"

import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-gray-800 p-3 text-white shadow-lg">
        <p className="mb-1 text-sm font-medium">{`${label} 29`}</p>
        <p className="text-xs text-gray-300">Total Payment</p>
        <p className="text-sm font-bold">{`N${payload[0].value?.toLocaleString()}`}</p>
      </div>
    )
  }
  return null
}

import { useFeesAnalytics } from "../_hooks/use-fees-analytics"
import { Skeleton } from "@/components/ui/skeleton"

const FeesChart = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = React.useState(currentYear.toString())

  // Generate last 5 years
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())

  const { data, isLoading } = useFeesAnalytics({ year: parseInt(year) })
  const chartData =
    data?.data?.data?.monthly_payments.map((item) => ({
      name: item.month,
      value: item.total_payment,
    })) || []

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Fees Payment</h3>
        <div className="flex gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              {/* <SelectItem value="yearly">Yearly</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value === 0) return "0"
                  return `${value / 1000}k`
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default FeesChart
