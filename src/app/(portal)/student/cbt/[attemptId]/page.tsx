"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cloud,
  CloudOff,
  Send,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CbtAPI, CbtQuestion } from "@/lib/cbt"
import {
  clearOfflineAnswers,
  getOfflineAnswers,
  markOfflineAnswerSynced,
  saveOfflineAnswer,
} from "@/lib/cbt-offline"

interface LocalAnswer {
  value: unknown
  revision: number
  synced: boolean
}

function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
}

function hasAnswer(value: unknown) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "string") return value.trim().length > 0
  return value !== undefined && value !== null
}

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
        {options.map((option, index) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,white)] ring-1 ring-[var(--primary)]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  selected
                    ? "bg-[var(--primary)] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {selected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className="pt-0.5 text-sm leading-6 text-slate-800">
                {option.text}
              </span>
            </button>
          )
        })}
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
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300"
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
            <span className="text-sm leading-6 text-slate-800">{option.text}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <Textarea
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={
        question.type === "essay" ? "Write your answer here…" : "Enter your answer…"
      }
      className="min-h-40 resize-y bg-white"
    />
  )
}

export default function CbtAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({})
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  )
  const [now, setNow] = useState(0)
  const hydrated = useRef(false)
  const submitting = useRef(false)
  const syncTimers = useRef<Record<string, number>>({})

  const attempt = useQuery({
    queryKey: ["cbt", "attempt", attemptId],
    queryFn: () => CbtAPI.getAttempt(attemptId),
    enabled: Boolean(attemptId),
    refetchOnWindowFocus: false,
  })
  const submit = useMutation({ mutationFn: () => CbtAPI.submitAttempt(attemptId) })

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      CbtAPI.recordConnection(attemptId, "connection_restored").catch(() => undefined)
    }
    const handleOffline = () => {
      setOnline(false)
      CbtAPI.recordConnection(attemptId, "connection_lost").catch(() => undefined)
    }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [attemptId])

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const initial = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!attempt.data || hydrated.current) return
    void (async () => {
      const serverAnswers = Object.fromEntries(
        (attempt.data.answers ?? []).map((answer) => [
          answer.questionId,
          { value: answer.answerData?.value, revision: answer.revision, synced: true },
        ])
      )
      const offlineAnswers = await getOfflineAnswers(attemptId)
      const merged = { ...serverAnswers }
      offlineAnswers.forEach((answer) => {
        const server = merged[answer.questionId]
        if (!server || answer.revision > server.revision) {
          merged[answer.questionId] = {
            value: answer.answer.value,
            revision: answer.revision,
            synced: answer.synced,
          }
        }
      })
      setAnswers(merged)
      hydrated.current = true
    })().catch(() => toast.error("Could not restore locally saved answers"))
  }, [attempt.data, attemptId])

  const syncAnswer = useCallback(
    async (questionId: string, local: LocalAnswer) => {
      try {
        await CbtAPI.saveAnswer(
          attemptId,
          questionId,
          { value: local.value },
          local.revision
        )
        await markOfflineAnswerSynced(attemptId, questionId, local.revision)
        setAnswers((current) => ({
          ...current,
          [questionId]:
            current[questionId]?.revision === local.revision
              ? { ...current[questionId], synced: true }
              : current[questionId],
        }))
        return true
      } catch {
        return false
      }
    },
    [attemptId]
  )

  useEffect(() => {
    if (!online || !hydrated.current) return
    void getOfflineAnswers(attemptId).then((pending) =>
      Promise.all(
        pending
          .filter((answer) => !answer.synced)
          .map((answer) =>
            syncAnswer(answer.questionId, {
              value: answer.answer.value,
              revision: answer.revision,
              synced: false,
            })
          )
      )
    )
  }, [attemptId, online, syncAnswer])

  useEffect(
    () => () => {
      Object.values(syncTimers.current).forEach((timer) => window.clearTimeout(timer))
    },
    []
  )

  const chooseAnswer = async (questionId: string, value: unknown) => {
    const local: LocalAnswer = {
      value,
      revision: (answers[questionId]?.revision ?? 0) + 1,
      synced: false,
    }
    setAnswers((current) => ({ ...current, [questionId]: local }))
    await saveOfflineAnswer({
      attemptId,
      questionId,
      answer: { value },
      revision: local.revision,
      synced: false,
    })
    if (navigator.onLine) {
      window.clearTimeout(syncTimers.current[questionId])
      syncTimers.current[questionId] = window.setTimeout(() => {
        void syncAnswer(questionId, local)
      }, 500)
    }
  }

  const submitAttempt = useCallback(
    async (automatic = false) => {
      if (submitting.current) return
      if (
        !automatic &&
        !window.confirm("Submit this examination? You cannot change answers afterwards.")
      )
        return
      submitting.current = true
      try {
        const pending = await getOfflineAnswers(attemptId)
        const results = await Promise.all(
          pending
            .filter((item) => !item.synced)
            .map((item) =>
              syncAnswer(item.questionId, {
                value: item.answer.value,
                revision: item.revision,
                synced: false,
              })
            )
        )
        if (results.some((result) => !result)) {
          toast.error(
            "Some answers are still only on this device. Reconnect before submitting."
          )
          submitting.current = false
          return
        }
        await submit.mutateAsync()
        await clearOfflineAnswers(attemptId)
        toast.success("Examination submitted")
        router.replace("/student/cbt")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not submit examination"
        )
        submitting.current = false
      }
    },
    [attemptId, router, submit, syncAnswer]
  )

  const remaining =
    attempt.data && now ? new Date(attempt.data.deadline).getTime() - now : 1
  useEffect(() => {
    if (attempt.data && remaining <= 0 && attempt.data.status === "in_progress") {
      void submitAttempt(true)
    }
  }, [attempt.data, remaining, submitAttempt])

  if (attempt.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-[520px]" />
      </div>
    )
  }
  if (attempt.isError || !attempt.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to open examination</AlertTitle>
          <AlertDescription>
            Your saved answers remain on this device. Check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const questions = attempt.data.questions
  const current = questions[currentIndex]
  const answeredCount = questions.filter((question) =>
    hasAnswer(answers[question.id]?.value)
  ).length
  const pendingCount = Object.values(answers).filter((answer) => !answer.synced).length

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Examination
            </p>
            <h1 className="font-semibold text-slate-950">{attempt.data.exam.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={online && pendingCount === 0 ? "secondary" : "outline"}>
              {online && pendingCount === 0 ? (
                <Cloud className="mr-1 h-3.5 w-3.5" />
              ) : (
                <CloudOff className="mr-1 h-3.5 w-3.5" />
              )}
              {!online
                ? "Saving locally"
                : pendingCount
                  ? `${pendingCount} waiting to sync`
                  : "Saved"}
            </Badge>
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold ${remaining < 300_000 ? "bg-red-50 text-red-700" : "bg-slate-100"}`}
            >
              <Clock3 className="h-4 w-4" /> {formatRemaining(remaining)}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-6">
        <aside className="rounded-2xl border bg-white p-4 md:sticky md:top-24 md:h-fit">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-slate-500">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2 md:grid-cols-5">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-lg text-xs font-semibold ${
                  index === currentIndex
                    ? "bg-[var(--primary)] text-white"
                    : hasAnswer(answers[question.id]?.value)
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <Button
            className="mt-5 w-full"
            onClick={() => void submitAttempt()}
            disabled={submit.isPending}
          >
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
        </aside>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5 md:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--primary)]">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                {current.topic && (
                  <p className="mt-1 text-xs text-slate-500">{current.topic}</p>
                )}
              </div>
              <Badge variant="outline">
                {Number(current.marks)} {Number(current.marks) === 1 ? "mark" : "marks"}
              </Badge>
            </div>
            <p className="mb-7 text-base leading-7 font-medium whitespace-pre-wrap text-slate-950 md:text-lg">
              {current.body}
            </p>
            <QuestionInput
              question={current}
              value={answers[current.id]?.value}
              onChange={(value) => void chooseAnswer(current.id, value)}
            />
            <div className="mt-8 flex items-center justify-between border-t pt-5">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => index - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((index) => index + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => void submitAttempt()} disabled={submit.isPending}>
                  Submit examination
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
