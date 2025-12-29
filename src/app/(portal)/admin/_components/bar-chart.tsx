"use client"

import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts" // <-- Add YAxis here
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LucideIcon } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { TypedChartConfig } from "@/types/chart"

interface ReuseableBarChartProps<XKey extends string, BarKey extends string> {
  title: string
  icon: LucideIcon
  xKey: XKey
  data: Record<XKey, string | number>[] & Record<BarKey, number>[]
  bars: BarKey[]
  config: TypedChartConfig<BarKey>
  dropdown?: { label: string; value: string }[]
  footer?: { label: string; color: string }[]
}

export function ReuseableBarChart<XKey extends string, BarKey extends string>({
  title,
  icon: Icon,
  xKey,
  data,
  bars,
  config,
  dropdown,
  footer,
}: ReuseableBarChartProps<XKey, BarKey>) {
  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="text-primary" />
            <span>{title}</span>
          </div>

          {dropdown && (
            <Select>
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
      </CardHeader>

      <CardContent>
        <ChartContainer config={config}>
          <BarChart data={data} barCategoryGap={10} barGap={0}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              // Optional: format the numbers, e.g., thousands separator
              // tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            {bars.map((barKey) => (
              <Bar key={barKey} dataKey={barKey} fill={config[barKey].color} radius={0} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>

      {footer && (
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
