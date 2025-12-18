"use client"

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {/* Filter skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-10 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-full rounded bg-gray-200" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid h-12 grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
              <div key={j} className="h-8 rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
