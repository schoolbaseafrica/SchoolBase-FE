"use client"

import { Card, CardFooter, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TypedChartConfig } from "@/types/chart"
import { Loader2, LucideIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ReuseableBarChartProps<XKey extends string, BarKey extends string> {
  title: string
  icon: LucideIcon
  xKey: XKey
  data: Array<Record<XKey | BarKey, string | number>>
  bars: BarKey[]
  config: TypedChartConfig<BarKey>
  dropdown?: { label: string; value: string }[]
  onDropdownChange?: (value: string) => void
  footer?: { label: string; color: string }[]
  isLoading?: boolean
  emptyText?: string
}

export function ReuseableBarChart<XKey extends string, BarKey extends string>({
  title,
  icon: Icon,
  xKey,
  data,
  bars,
  config,
  dropdown,
  onDropdownChange,
  footer,
  isLoading,
  emptyText = "No data available",
}: ReuseableBarChartProps<XKey, BarKey>) {
  const isEmpty = !isLoading && data.length === 0

  return (
    <Card className="p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-primary" />
          <span>{title}</span>
        </div>

        {dropdown && (
          <Select onValueChange={onDropdownChange} defaultValue={dropdown[0]?.value}>
            <SelectTrigger className="border-accent text-accent w-[135px]">
              <SelectValue placeholder={dropdown[0]?.label} />
            </SelectTrigger>
            <SelectContent>
              {dropdown.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardTitle>

      <div className="h-full min-h-[200px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full w-full items-center justify-center rounded-md border bg-white p-6 text-gray-500 shadow-sm">
            {emptyText}
          </div>
        ) : (
          <ChartContainer config={config}>
            <BarChart data={data} barCategoryGap={10} barGap={0}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              {bars.map((barKey) => (
                <Bar
                  key={barKey}
                  dataKey={barKey}
                  fill={config[barKey].color}
                  radius={0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </div>

      {footer && !isEmpty && (
        <CardFooter className="flex items-center gap-6 text-sm">
          {footer.map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
