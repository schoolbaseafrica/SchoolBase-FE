"use client"

import { Term, StudentResult } from "@/types/result"
import { DownloadButton } from "./download-button"
import { ResultsTable } from "@/app/(portal)/student/results/_components/results-table" // Use shared
import { OverallSummary } from "@/app/(portal)/student/results/_components/overall-summary" // Use shared
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentBasicInfo } from "@/types/result"
import { EmptyState } from "@/components/results/empty-state" // Use shared
import { AlertCircle } from "lucide-react"

interface ParentResultsViewProps {
  selectedStudent: StudentBasicInfo
  activeTerm?: Term
  results: StudentResult[]
  isLoading: boolean
}

export function ParentResultsView({
  selectedStudent,
  activeTerm,
  results,
  isLoading,
}: ParentResultsViewProps) {
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
                <p className="text-lg font-semibold">{selectedStudent.full_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Registration Number
                </span>
                <p className="text-lg font-semibold">
                  {selectedStudent.registration_number}
                </p>
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

      {/* Download Button - Only show if results exist */}
      {currentResult && activeTerm && (
        <div className="flex justify-end">
          <DownloadButton
            result={currentResult}
            studentId={selectedStudent.id}
            className={currentResult.class_name || "Class"}
            term={activeTerm.name}
          />
        </div>
      )}

      {/* Overall Summary - Only show if results exist */}
      {currentResult && <OverallSummary result={currentResult} />}

      {/* Results Table */}
      <ResultsTable result={currentResult} isLoading={isLoading} />

      {/* No Results Message */}
      {!currentResult && !isLoading && (
        <EmptyState
          title="No Results Available"
          description={`No results are available for ${selectedStudent.full_name} in the current term. Results will appear here once they are approved by teachers and admin.`}
          icon={AlertCircle}
        />
      )}
    </div>
  )
}
