"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CbtAPI } from "@/lib/cbt"

export default function TeacherExamScoresPage() {
  const exams = useQuery({
    queryKey: ["cbt", "teacher", "exams"],
    queryFn: CbtAPI.listTeacherExams,
  })

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <p className="portal-section-label mb-2">Assessments</p>
        <h1 className="text-3xl font-semibold">Exam scores</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          View scores for students in your class or a subject you teach.
        </p>
      </div>
      {exams.isLoading && (
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      )}
      {exams.isError && (
        <Card>
          <CardContent className="p-5 text-sm text-red-700">
            Exams could not be loaded. Try refreshing this page.
          </CardContent>
        </Card>
      )}
      {!exams.isLoading && !exams.isError && !exams.data?.length && (
        <Card>
          <CardContent className="text-muted-foreground p-8 text-center text-sm">
            No exams are assigned to your classes or subjects yet.
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {exams.data?.map((exam) => (
          <Card key={exam.id} className="rounded-2xl">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <h2 className="font-semibold break-words">{exam.name}</h2>
                <Badge className="mt-2" variant="outline">
                  {exam.status}
                </Badge>
              </div>
              <Button asChild variant="outline">
                <Link href={`/teacher/exam-scores/${exam.id}`}>View scores</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
