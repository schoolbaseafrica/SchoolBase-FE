import React, { FC, SVGProps } from "react"
// import { MoveUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { Card } from "@/components/ui/card"

export interface StatItem {
  name: string
  quantity: string | number
  percentage: number
  icon:
    | LucideIcon
    | FC<SVGProps<SVGSVGElement>>
    | React.ComponentType<{ className?: string }>
}

interface StatCardProps {
  stats: StatItem[]
  isLoading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="portal-reveal mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>

            <Skeleton className="mb-3 h-8 w-20" />

            <Skeleton className="h-4 w-28" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="portal-reveal mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <Card
            key={index}
            className="flex flex-col justify-between p-5 transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-lg"
          >
            {/* --- ICON + TITLE --- */}
            <div className="mb-4 flex items-center gap-3">
              {/* Mobile Icon */}
              <span className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-2xl">
                <Icon className="size-5" />
              </span>

              <p className="text-muted-foreground text-sm font-medium">{stat.name}</p>
            </div>

            {/* --- QUANTITY --- */}
            <div className="mb-3">
              <p className="text-foreground text-[28px] leading-[30px] font-semibold tracking-tight sm:text-3xl">
                {stat.quantity}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default StatCard
