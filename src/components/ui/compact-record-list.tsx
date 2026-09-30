import * as React from "react"

import { cn } from "@/lib/utils"

export function CompactMetricStrip({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid divide-x divide-y overflow-hidden rounded-xl border bg-white shadow-sm sm:divide-y-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CompactMetric({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:block",
        className
      )}
    >
      <div className="text-xs font-medium text-gray-500 capitalize">{label}</div>
      <div className="text-xl font-semibold tabular-nums sm:mt-1">{value}</div>
    </div>
  )
}

export function CompactRecordList({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border bg-white shadow-sm", className)}
    >
      {children}
    </div>
  )
}

export function CompactRecordHeader({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "hidden border-b bg-gray-50/80 px-4 py-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase md:grid",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CompactRecordRow({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-3 my-2 grid gap-3 rounded-lg border bg-white p-3 shadow-xs last:mb-3 md:m-0 md:min-h-16 md:rounded-none md:border-0 md:border-b md:px-4 md:py-2 md:shadow-none md:last:border-b-0",
        className
      )}
    >
      {children}
    </div>
  )
}
