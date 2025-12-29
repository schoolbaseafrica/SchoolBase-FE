"use client"

import { GradeSubmission } from "@/types/result"
import { SubmissionCard } from "./submission-card"
import { ItemLoader } from "../../_components/sub-loader"

interface SubmissionsGridProps {
  submissions: GradeSubmission[]
  isLoading: boolean
}

export function SubmissionsGrid({ submissions, isLoading }: SubmissionsGridProps) {
  if (isLoading) {
    return <ItemLoader item="Submissions" />
  }

  if (submissions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold text-gray-900">No submissions found</h3>
          <p className="mt-2 text-gray-600">
            No grade submissions match your current filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  )
}
