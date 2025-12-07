"use client"

import { ReactNode } from "react"
import { ErrorDisplay } from "./error-display"
import { EmptyState } from "./empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface ResultsContainerProps {
  title: string
  subtitle?: string
  isLoading: boolean
  error?: Error | null
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
  onRetry?: () => void
  customEmptyState?: ReactNode
}

export function ResultsContainer({
  title,
  subtitle,
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
  onRetry,
  customEmptyState,
}: ResultsContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay
              title="Unable to Load Results"
              message={error.message}
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && !isEmpty && children}

        {/* Empty State */}
        {!isLoading && !error && isEmpty && (
          <div className="mt-6">
            {customEmptyState || (
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={AlertCircle}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
