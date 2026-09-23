"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, Clock3, Send } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CbtQuestion, PublicCbtAPI } from "@/lib/cbt"

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: CbtQuestion
  value: unknown
  onChange: (value: unknown) => void
}) {
  if (question.type === "mcq" || question.type === "true_false") {
    const options =
      question.type === "true_false"
        ? [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ]
        : (question.options ?? [])
    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${value === option.id ? "border-[var(--primary)] bg-red-50" : "bg-white"}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${value === option.id ? "bg-[var(--primary)] text-white" : "bg-slate-100"}`}
            >
              {value === option.id ? (
                <Check className="h-4 w-4" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>
    )
  }
  if (question.type === "multiple_response") {
    const selected = Array.isArray(value) ? (value as string[]) : []
    return (
      <div className="space-y-3">
        {(question.options ?? []).map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer gap-3 rounded-xl border bg-white p-4"
          >
            <Checkbox
              checked={selected.includes(option.id)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, option.id]
                    : selected.filter((id) => id !== option.id)
                )
              }
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    )
  }
  return (
    <Textarea
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-40 bg-white"
      placeholder="Enter your answer…"
    />
  )
}

function remaining(deadline?: string) {
  if (!deadline) return "--:--"
  const seconds = Math.max(
    0,
    Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)
  )
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}

export default function PublicCbtAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  const [token] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (sessionStorage.getItem(`cbt-token:${attemptId}`) ?? "")
  )
  const [answers, setAnswers] = useState<
    Record<string, { value: unknown; revision: number }>
  >({})
  const [now, setNow] = useState(0)
  const attempt = useQuery({
    queryKey: ["public-cbt", "attempt", attemptId],
    queryFn: () => PublicCbtAPI.getAttempt(attemptId, token),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  })
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!token) return
    const visibility = () =>
      PublicCbtAPI.recordEvent(
        attemptId,
        token,
        document.hidden ? "visibility_hidden" : "visibility_visible"
      ).catch(() => undefined)
    const offline = () =>
      PublicCbtAPI.recordEvent(attemptId, token, "connection_lost").catch(() => undefined)
    const online = () =>
      PublicCbtAPI.recordEvent(attemptId, token, "connection_restored").catch(
        () => undefined
      )
    document.addEventListener("visibilitychange", visibility)
    window.addEventListener("offline", offline)
    window.addEventListener("online", online)
    return () => {
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("offline", offline)
      window.removeEventListener("online", online)
    }
  }, [attemptId, token])
  const submit = useMutation({
    mutationFn: () => PublicCbtAPI.submitAttempt(attemptId, token),
    onSuccess: () => {
      sessionStorage.removeItem(`cbt-token:${attemptId}`)
      toast.success("Your examination was submitted")
      router.push("/cbt")
    },
    onError: (error: Error) => toast.error(error.message || "Submission failed"),
  })
  const answered = useMemo(() => {
    const questionIds = new Set([
      ...Object.entries(answers)
        .filter(
          ([, item]) =>
            item.value !== "" && item.value !== null && item.value !== undefined
        )
        .map(([questionId]) => questionId),
      ...(attempt.data?.answers ?? [])
        .filter(
          (item) =>
            item.answerData.value !== "" &&
            item.answerData.value !== null &&
            item.answerData.value !== undefined
        )
        .map((item) => item.questionId),
    ])
    return questionIds.size
  }, [answers, attempt.data?.answers])
  const changeAnswer = async (questionId: string, value: unknown) => {
    const serverAnswer = attempt.data?.answers?.find(
      (item) => item.questionId === questionId
    )
    const revision = (answers[questionId]?.revision ?? serverAnswer?.revision ?? 0) + 1
    setAnswers((current) => ({ ...current, [questionId]: { value, revision } }))
    try {
      await PublicCbtAPI.saveAnswer(attemptId, questionId, token, { value }, revision)
    } catch {
      toast.error("An answer could not be saved. Check your connection and try again.")
    }
  }
  if (!token)
    return (
      <main className="p-12 text-center">
        <p className="text-slate-600">
          This secure exam link is no longer available in this browser.
        </p>
        <Button className="mt-4" onClick={() => router.push("/cbt")}>
          Return to examinations
        </Button>
      </main>
    )
  if (attempt.isLoading || !attempt.data)
    return (
      <main className="mx-auto max-w-4xl p-8">
        <Skeleton className="h-96 rounded-2xl" />
      </main>
    )
  void now
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="sticky top-0 z-10 flex items-center justify-between rounded-2xl border bg-white/95 p-4 shadow-sm backdrop-blur">
          <div>
            <p className="font-semibold">{attempt.data.exam.name}</p>
            <p className="text-xs text-slate-500">
              {answered} of {attempt.data.questions.length} answered
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Clock3 className="h-4 w-4" />
            {remaining(attempt.data.deadline)}
          </Badge>
        </header>
        {attempt.data.questions.map((question, index) => {
          const serverAnswer = attempt.data.answers?.find(
            (item) => item.questionId === question.id
          )
          return (
            <Card key={question.id} className="rounded-2xl">
              <CardContent className="space-y-5 p-5 md:p-7">
                <div className="flex justify-between gap-4">
                  <p className="font-medium">
                    <span className="mr-2 text-slate-400">{index + 1}.</span>
                    {question.body}
                  </p>
                  <Badge variant="secondary">
                    {Number(question.marks)} mark{Number(question.marks) === 1 ? "" : "s"}
                  </Badge>
                </div>
                <QuestionInput
                  question={question}
                  value={answers[question.id]?.value ?? serverAnswer?.answerData.value}
                  onChange={(value) => void changeAnswer(question.id, value)}
                />
              </CardContent>
            </Card>
          )
        })}
        <Button
          className="w-full"
          size="lg"
          disabled={submit.isPending}
          onClick={() => {
            if (
              window.confirm(
                "Submit your final answers? You cannot change them afterwards."
              )
            )
              submit.mutate()
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit examination
        </Button>
      </div>
    </main>
  )
}
