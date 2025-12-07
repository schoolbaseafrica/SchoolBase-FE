// File: src/components/results/shared-results-view.tsx
"use client"

import { Term, StudentResult } from "@/types/result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OverallSummary } from "@/app/(portal)/student/results/_components/overall-summary"
import { ResultsTable } from "@/app/(portal)/student/results/_components/results-table"
import { DownloadButton } from "@/app/(portal)/student/results/_components/download-button"

interface SharedResultsViewProps {
  studentId: string
  studentName: string
  registrationNumber?: string
  activeTerm?: Term
  results: StudentResult[]
  isLoading: boolean
  showDownloadButton?: boolean
}

export function SharedResultsView({
  studentId,
  studentName,
  registrationNumber,
  activeTerm,
  results,
  isLoading,
  showDownloadButton = true,
}: SharedResultsViewProps) {
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
              {registrationNumber && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Registration Number
                  </span>
                  <p className="text-lg font-semibold">{registrationNumber}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Student ID</span>
                <p className="text-lg font-semibold">{studentId}</p>
              </div>
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
                    <span className="text-sm font-medium text-gray-500">Class</span>
                    <p className="text-lg font-semibold">
                      {currentResult.class_name || "-"}
                    </p>
                  </div>
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

      {/* Download Button - Only show if results exist and enabled */}
      {showDownloadButton && currentResult && activeTerm && (
        <div className="flex justify-end">
          <DownloadButton
            result={currentResult}
            studentId={studentId}
            className={currentResult.class_name || "Class"}
            term={activeTerm.name}
          />
        </div>
      )}

      {/* Overall Summary - Only show if results exist */}
      {currentResult && <OverallSummary result={currentResult} />}

      {/* Results Table */}
      <ResultsTable result={currentResult} isLoading={isLoading} />
    </div>
  )
}
