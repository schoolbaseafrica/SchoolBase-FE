"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ClassroomsSkeletonProps {
  count?: number
}

export function ClassroomsSkeleton({ count = 6 }: ClassroomsSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  <div className="mt-4">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
