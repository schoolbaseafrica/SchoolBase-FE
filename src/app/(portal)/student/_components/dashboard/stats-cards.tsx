"use client"

import { LucideIcon, GraduationCap, Book, Check, Table } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Stat {
  label: string
  value: string
  icon: LucideIcon
}

interface StatsCardsProps {
  stats: Stat[]
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg border bg-white p-4 py-7"
          >
            <Skeleton className="h-6 w-6" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-lg border bg-white p-4 py-7"
        >
          <stat.icon className="text-accent" />
          <div>
            <div className="mb-1 text-sm text-gray-600">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
