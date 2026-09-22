"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { BookOpenCheck, Clock, RotateCcw, ShieldCheck, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CbtAPI, CbtExamSummary } from "@/lib/cbt"

function availability(exam: CbtExamSummary) {
  if (exam.availableTo) return `Closes ${format(new Date(exam.availableTo), "PPp")}`
  if (exam.availableFrom) return `Opens ${format(new Date(exam.availableFrom), "PPp")}`
  return "Available now"
}

export default function StudentCbtPage() {
  const router = useRouter()
  const exams = useQuery({
    queryKey: ["cbt", "student", "exams"],
    queryFn: CbtAPI.listStudentExams,
  })
  const start = useMutation({
    mutationFn: CbtAPI.startAttempt,
    onSuccess: (attempt) => router.push(`/student/cbt/${attempt.id}`),
    onError: (error: Error) =>
      toast.error(error.message || "Could not open the examination"),
  })

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" />
            Computer-based testing
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
            Examinations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Answers are saved on this device first, so a short connection interruption
            will not erase your work.
          </p>
        </header>

        {exams.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : exams.isError ? (
          <Card className="border-red-200">
            <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
              <WifiOff className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold">Unable to load examinations</p>
                <p className="text-sm text-slate-500">
                  Check your connection and try again.
                </p>
              </div>
              <Button variant="outline" onClick={() => exams.refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : !exams.data?.length ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <BookOpenCheck className="mb-3 h-9 w-9 text-slate-400" />
              <p className="font-semibold">No examination is currently available</p>
              <p className="mt-1 text-sm text-slate-500">
                Scheduled examinations will appear here when they open.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams.data.map((exam) => {
              const active = exam.attempts?.find(
                (attempt) => attempt.status === "in_progress"
              )
              const submitted =
                exam.attempts?.filter((attempt) => attempt.status === "submitted")
                  .length ?? 0
              const exhausted = !active && submitted >= exam.maxAttempts
              return (
                <Card
                  key={exam.id}
                  className="flex flex-col rounded-2xl border-slate-200 shadow-sm"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg leading-snug">{exam.name}</CardTitle>
                      <Badge variant={active ? "default" : "secondary"}>
                        {active ? "In progress" : exhausted ? "Completed" : "Available"}
                      </Badge>
                    </div>
                    <p className="line-clamp-3 text-sm text-slate-600">
                      {exam.instructions ||
                        "Read every question carefully before submitting."}
                    </p>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="mt-1 flex items-center gap-1 font-medium">
                          <Clock className="h-4 w-4" /> {exam.timeLimitMinutes} min
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Attempts</p>
                        <p className="mt-1 font-medium">
                          {submitted}/{exam.maxAttempts} used
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{availability(exam)}</p>
                    <Button
                      className="w-full"
                      disabled={exhausted || start.isPending}
                      onClick={() =>
                        active
                          ? router.push(`/student/cbt/${active.id}`)
                          : start.mutate(exam.id)
                      }
                    >
                      {active && <RotateCcw className="mr-2 h-4 w-4" />}
                      {active
                        ? "Resume examination"
                        : exhausted
                          ? "Attempts completed"
                          : "Start examination"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
