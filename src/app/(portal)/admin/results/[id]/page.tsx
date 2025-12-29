"use client"

import { useParams } from "next/navigation"
import { SubmissionReview } from "../_components/submission-review"
import { useGetSubmission } from "../_hooks/use-admin-results"
import { Loader2 } from "lucide-react"

export default function SubmissionReviewPage() {
  const params = useParams()
  const submissionId = params.id as string
  const { data: submission, isLoading } = useGetSubmission(submissionId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Submission not found</h3>
            <p className="mt-2 text-gray-600">
              The requested grade submission could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <SubmissionReview submission={submission} />
      </div>
    </div>
  )
}
