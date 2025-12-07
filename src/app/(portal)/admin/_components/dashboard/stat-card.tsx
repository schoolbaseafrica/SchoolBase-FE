import React, { FC, SVGProps } from "react"
import { MoveUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { Card } from "@/components/ui/card"

export interface StatItem {
  name: string
  quantity: string | number
  percentage: number
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>
}

interface StatCardProps {
  stats: StatItem[]
  isLoading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-[33px] grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="mt-[33px] grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <Card key={index} className="flex flex-col justify-between p-4">
            {/* --- ICON + TITLE --- */}
            <div className="mb-3 flex items-center gap-2">
              {/* Mobile Icon */}
              <Icon className="text-accent text-xl lg:hidden" />

              {/* Desktop Icon */}
              <Icon className="text-accent hidden text-2xl lg:block" />

              <p className="text-text-secondary text-sm font-medium lg:text-xl">
                {stat.name}
              </p>
            </div>

            {/* --- QUANTITY --- */}
            <div className="mb-3">
              <p className="text-primary text-[28px] leading-[30px] font-semibold">
                {stat.quantity}
              </p>
            </div>

            {/* --- FOOTER / PERCENTAGE --- */}
            <div>
              <p className="flex items-center gap-1 text-xs text-[#686868]">
                <MoveUp className="text-secondary size-3" />
                <span className="text-secondary mr-1">{stat.percentage}%</span>
                Since this term
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default StatCard
