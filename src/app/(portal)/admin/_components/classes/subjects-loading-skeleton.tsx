import { Skeleton } from "@/components/ui/skeleton"

export function SubjectsLoadingSkeleton() {
  return (
    <div>
      {/* Session and Class Info Skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Subjects Label Skeleton */}
      <Skeleton className="mb-4 h-5 w-36" />

      {/* Subjects List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            {/* Icon Skeleton */}
            <Skeleton className="h-12 w-12 rounded-lg" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
