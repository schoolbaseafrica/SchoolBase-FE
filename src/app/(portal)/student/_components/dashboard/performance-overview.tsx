"use client"

import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { LatestResult } from "@/lib/api/student"

interface PerformanceOverviewProps {
  results?: LatestResult[]
  metadata?: {
    class?: string
    enrollment_status?: string
    total_subjects?: number
  }
  isLoading?: boolean
}

export function PerformanceOverview({
  results,
  metadata,
  isLoading,
}: PerformanceOverviewProps) {
  // Calculate average score from results
  const averageScore = useMemo(() => {
    if (!results || results.length === 0) return null

    const scores = results.map((result) => result.score || 0).filter((score) => score > 0) // Filter out invalid scores

    if (scores.length === 0) return null

    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    return Math.round(totalScore / scores.length)
  }, [results])

  // Calculate grade from score
  const getGradeFromScore = (score: number): string => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  const grade = averageScore ? getGradeFromScore(averageScore) : null
  const gradeSign =
    averageScore && averageScore >= 87
      ? "+"
      : averageScore && averageScore <= 72
        ? "-"
        : ""

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 border-b pb-1.5 text-lg font-semibold text-gray-800">
        Performance Overview
      </h2>

      {metadata?.class ? (
        <>
          <h3 className="text-text-secondary text-xl font-normal lg:text-2xl">
            {metadata.class}
          </h3>
          <div className="mb-4">
            {results && results.length > 0 ? (
              <>
                {averageScore !== null && (
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-base font-medium text-gray-600">
                      Average Score
                    </span>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-400">
                      <span className="text-text-secondary text-center text-[0.625rem] font-medium">
                        {averageScore}% <br /> {grade}
                        {gradeSign}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-base font-medium text-gray-600">
                    Latest Results
                  </span>
                  <span className="text-sm text-gray-500">
                    {results.length} {results.length === 1 ? "subject" : "subjects"}
                  </span>
                </div>
                <div className="space-y-2">
                  {results.slice(0, 5).map((result, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <span className="text-sm text-gray-700">{result.subject_name}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {result.score || "N/A"} (
                        {result.grade ||
                          (result.score ? getGradeFromScore(result.score) : "N/A")}
                        )
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No results available yet
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="py-4 text-center text-sm text-gray-500">
          No class information available
        </p>
      )}
    </div>
  )
}
