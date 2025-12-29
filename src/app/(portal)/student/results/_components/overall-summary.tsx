// File: app/(portal)/student/results/_components/overall-summary.tsx
"use client"

import { StudentResult } from "@/types/result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OverallSummaryProps {
  result: StudentResult
}

export function OverallSummary({ result }: OverallSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Overall Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-sm font-medium text-gray-500">Total Score</span>
            <p className="text-2xl font-bold">{result.total_score}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <span className="text-sm font-medium text-gray-500">Average Score</span>
            <p className="text-2xl font-bold">{result.average_score.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <span className="text-sm font-medium text-gray-500">Overall Grade</span>
            <p
              className={`text-2xl font-bold ${
                result.grade_letter === "A"
                  ? "text-green-600"
                  : result.grade_letter === "B"
                    ? "text-blue-600"
                    : result.grade_letter === "C"
                      ? "text-yellow-600"
                      : result.grade_letter === "D" || result.grade_letter === "E"
                        ? "text-orange-600"
                        : "text-red-600"
              }`}
            >
              {result.grade_letter}
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <span className="text-sm font-medium text-gray-500">Subjects Taken</span>
            <p className="text-2xl font-bold">{result.subject_count}</p>
          </div>
        </div>

        {/* Remark Section */}
        {result.remark && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-600">
              Class Teacher Comment:
            </h3>
            <p className="text-gray-700">{result.remark}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
