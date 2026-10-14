"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CbtAPI } from "@/lib/cbt"

export default function TeacherExamScoreDetailPage() {
  const { examId } = useParams<{ examId: string }>()
  const exams = useQuery({
    queryKey: ["cbt", "teacher", "exams"],
    queryFn: CbtAPI.listTeacherExams,
  })
  const results = useQuery({
    queryKey: ["cbt", "teacher", "results", examId],
    queryFn: () => CbtAPI.getTeacherExamResults(examId),
    enabled: !!examId,
  })
  const exam = exams.data?.find((item) => item.id === examId)

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/teacher/exam-scores">
          <ArrowLeft className="mr-2 size-4" /> All exam scores
        </Link>
      </Button>
      <div>
        <p className="portal-section-label mb-2">Assessment results</p>
        <h1 className="text-3xl font-semibold">{exam?.name ?? "Exam scores"}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Only students in classes you are assigned to teach are shown.
        </p>
      </div>
      {results.isLoading && (
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      )}
      {results.isError && (
        <Card>
          <CardContent className="p-5 text-sm text-red-700">
            Scores could not be loaded for this exam.
          </CardContent>
        </Card>
      )}
      {results.data && (
        <Card className="overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Registration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.data.candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="p-4 font-medium">{candidate.studentName}</td>
                    <td className="p-4">{candidate.registrationNumber ?? "—"}</td>
                    <td className="p-4">
                      {candidate.status === "not_started"
                        ? "Not started"
                        : candidate.status === "submitted"
                          ? "Submitted"
                          : "In progress"}
                    </td>
                    <td className="p-4">
                      {candidate.status !== "submitted"
                        ? "—"
                        : candidate.manualGradingRequired
                          ? "Awaiting marking"
                          : candidate.score === null
                            ? "Pending"
                            : `${candidate.score}/${candidate.totalMarks}${candidate.percentage === null ? "" : ` (${candidate.percentage}%)`}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  )
}
