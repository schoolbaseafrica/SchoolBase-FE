"use client"

import { Skeleton } from "./skeleton"

interface PageSkeletonProps {
  showHeader?: boolean
  showSearch?: boolean
  showFilters?: boolean
  contentRows?: number
}

export function PageSkeleton({
  showHeader = true,
  showSearch = false,
  showFilters = false,
  contentRows = 8,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      {(showSearch || showFilters) && (
        <div className="flex items-center justify-between gap-4">
          {showSearch && <Skeleton className="h-10 w-80" />}
          {showFilters && <Skeleton className="h-10 w-24" />}
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: contentRows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
