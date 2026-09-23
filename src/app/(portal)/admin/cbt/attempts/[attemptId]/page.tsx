"use client"

import { FormEvent, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, Send, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CbtAPI, CbtAttemptReview } from "@/lib/cbt"

function responseText(response: unknown) {
  if (response && typeof response === "object" && "value" in response) {
    const value = (response as { value: unknown }).value
    return typeof value === "string" ? value : JSON.stringify(value, null, 2)
  }
  return typeof response === "string" ? response : JSON.stringify(response, null, 2)
}

function AnswerCard({
  attemptId,
  answer,
}: {
  attemptId: string
  answer: CbtAttemptReview["answers"][number]
}) {
  const queryClient = useQueryClient()
  const [marks, setMarks] = useState(String(answer.marksAwarded ?? ""))
  const [comment, setComment] = useState(answer.grading?.comment ?? "")
  const grade = useMutation({
    mutationFn: () =>
      CbtAPI.gradeAttemptAnswer(attemptId, answer.questionId, {
        marksAwarded: Number(marks),
        comment,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cbt", "attempt-review", attemptId],
      })
      await queryClient.invalidateQueries({ queryKey: ["cbt", "manage"] })
      toast.success("Mark saved")
    },
    onError: (error: Error) => toast.error(error.message || "Could not save mark"),
  })
  const needsManualMark = answer.question.type === "essay" || answer.isCorrect === null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    grade.mutate()
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="outline">{answer.question.type.replace("_", " ")}</Badge>
          <CardTitle className="mt-3 text-base leading-6">
            {answer.question.body}
          </CardTitle>
        </div>
        <p className="shrink-0 text-sm font-medium">
          {answer.marksAwarded ?? "—"} / {answer.question.marks}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Candidate response
          </p>
          <pre className="mt-2 text-sm whitespace-pre-wrap text-slate-800">
            {responseText(answer.response) || "No response"}
          </pre>
        </div>
        {answer.question.correctAnswer && (
          <p className="text-sm text-slate-600">
            <span className="font-medium">Answer key:</span>{" "}
            {answer.question.correctAnswer}
          </p>
        )}
        {needsManualMark ? (
          <form
            className="grid gap-3 md:grid-cols-[140px_1fr_auto] md:items-end"
            onSubmit={submit}
          >
            <label className="grid gap-1.5 text-sm">
              <Label htmlFor={`marks-${answer.id}`}>Marks awarded</Label>
              <Input
                id={`marks-${answer.id}`}
                type="number"
                min={0}
                max={answer.question.marks}
                step="0.01"
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <Label htmlFor={`comment-${answer.id}`}>Marker comment</Label>
              <Textarea
                id={`comment-${answer.id}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-10"
              />
            </label>
            <Button type="submit" disabled={grade.isPending || marks === ""}>
              Save mark
            </Button>
          </form>
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Automatically marked
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function CbtAttemptReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const queryClient = useQueryClient()
  const review = useQuery({
    queryKey: ["cbt", "attempt-review", attemptId],
    queryFn: () => CbtAPI.getAttemptReview(attemptId),
  })
  const publish = useMutation({
    mutationFn: () => CbtAPI.publishAttemptResult(attemptId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cbt", "attempt-review", attemptId],
      })
      await queryClient.invalidateQueries({ queryKey: ["cbt", "manage"] })
      toast.success("Result published")
    },
    onError: (error: Error) => toast.error(error.message || "Could not publish result"),
  })

  if (review.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-80" />
      </div>
    )
  }
  if (review.isError || !review.data) {
    return (
      <div className="p-6 text-sm text-red-600">This attempt could not be loaded.</div>
    )
  }

  const attempt = review.data
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/admin/cbt/${attempt.exam.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" /> Back to examination
        </Link>
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm text-slate-500">{attempt.exam.name}</p>
                <h1 className="mt-1 text-2xl font-semibold">{attempt.candidate.name}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {attempt.candidate.email ||
                    attempt.candidate.registrationNumber ||
                    "Candidate"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {attempt.manualGradingRequired ? (
                  <Badge variant="secondary">
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Pending marking
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Marking complete
                  </Badge>
                )}
                {attempt.resultPublishedAt && (
                  <Badge variant="outline">Result published</Badge>
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Score</p>
                <p className="text-xl font-semibold">
                  {attempt.score} / {attempt.totalMarks}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Percentage</p>
                <p className="text-xl font-semibold">{attempt.percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-sm font-medium">
                  {attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleString()
                    : "Not submitted"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {attempt.answers.map((answer) => (
            <AnswerCard key={answer.id} attemptId={attemptId} answer={answer} />
          ))}
          {!attempt.answers.length && (
            <Card>
              <CardContent className="p-10 text-center text-slate-500">
                No answers were submitted.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Attempt activity</CardTitle>
          </CardHeader>
          <CardContent>
            {attempt.events.length ? (
              <div className="space-y-2">
                {attempt.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col justify-between gap-1 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center"
                  >
                    <span className="font-medium">
                      {event.eventType.replaceAll("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No activity events recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold">Release this result</p>
              <p className="text-sm text-slate-500">
                Students can see a manually marked result only after it is published.
              </p>
            </div>
            <Button
              onClick={() => publish.mutate()}
              disabled={
                publish.isPending ||
                attempt.manualGradingRequired ||
                Boolean(attempt.resultPublishedAt)
              }
            >
              <Send className="mr-2 h-4 w-4" />
              {attempt.resultPublishedAt ? "Published" : "Publish result"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
