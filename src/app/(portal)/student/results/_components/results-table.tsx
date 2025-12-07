// File: app/(portal)/student/results/_components/results-table.tsx
"use client"

import { StudentResult } from "@/types/result"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ResultsTableProps {
  result?: StudentResult
  isLoading: boolean
}

export function ResultsTable({ result, isLoading }: ResultsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!result || result.subjects.length === 0) {
    return null // Will be handled by empty state
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">CA Score (30)</TableHead>
                <TableHead className="text-center">Exam Score (70)</TableHead>
                <TableHead className="text-center">Total Score (100)</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.subjects.map((subject) => (
                <TableRow key={`${subject.subject_id}-${subject.result_id}`}>
                  <TableCell className="font-medium">
                    {subject.subject_name || subject.subject_id}
                  </TableCell>
                  <TableCell className="text-center">{subject.ca_score ?? "-"}</TableCell>
                  <TableCell className="text-center">
                    {subject.exam_score ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {subject.total_score ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        subject.grade_letter === "A"
                          ? "bg-green-100 text-green-800"
                          : subject.grade_letter === "B"
                            ? "bg-blue-100 text-blue-800"
                            : subject.grade_letter === "C"
                              ? "bg-yellow-100 text-yellow-800"
                              : subject.grade_letter === "D" ||
                                  subject.grade_letter === "E"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subject.grade_letter}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{subject.remark || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
