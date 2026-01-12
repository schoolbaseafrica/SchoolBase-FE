"use client"

import { PageSkeleton } from "@/components/ui/page-skeleton"

export function ItemLoader({ item }: { item: string }) {
  return (
    <div className="p-4 sm:p-6">
      <PageSkeleton
        showHeader={true}
        showSearch={false}
        showFilters={false}
        contentRows={8}
      />
    </div>
  )
}
