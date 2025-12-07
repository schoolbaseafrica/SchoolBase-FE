"use client"

import { Term, StudentResult } from "@/types/result"
import { DownloadButton } from "./download-button"
import { ResultsTable } from "./results-table"
import { OverallSummary } from "./overall-summary"
import { EmptyState } from "@/components/results/empty-state" // Use shared
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface StudentResultsViewProps {
  studentId: string
  studentName: string
  activeTerm?: Term
  results: StudentResult[]
  isLoading: boolean
}

export function StudentResultsView({
  studentId,
  studentName,
  activeTerm,
  results,
  isLoading,
}: StudentResultsViewProps) {
  // Get the current result (assuming latest result for active term)
  const currentResult = results.length > 0 ? results[0] : undefined

  return (
    <div className="space-y-6">
      {/* Student and Term Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="text-lg font-semibold">{studentName}</p>
              </div>
              {/* <div>
                <span className="text-sm font-medium text-gray-500">Student ID</span>
                <p className="text-lg font-semibold">{studentId}</p>
              </div> */}
              {currentResult && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Class</span>
                  <p className="text-lg font-semibold">
                    {currentResult.class_name || "-"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTerm && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Current Term</span>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{activeTerm.name}</p>
                    {activeTerm.is_active && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {currentResult && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Position in Class
                    </span>
                    <p className="text-lg font-semibold">
                      {currentResult.position ? `#${currentResult.position}` : "-"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button - Only show if results exist */}
      {currentResult && activeTerm && (
        <div className="flex justify-end">
          <DownloadButton
            result={currentResult}
            studentId={studentId}
            className={currentResult.class_name || "Class"}
            term={activeTerm.name}
          />
        </div>
      )}

      {/* Results Table */}
      <ResultsTable result={currentResult} isLoading={isLoading} />

      {/* Overall Summary - Only show if results exist */}
      {currentResult && <OverallSummary result={currentResult} />}

      {/* Empty State - Show when no results */}
      {!currentResult && !isLoading && (
        <EmptyState
          title="No Results Found"
          description="No results are available for the current term. Please check back later."
          icon={AlertCircle}
        />
      )}
    </div>
  )
}
