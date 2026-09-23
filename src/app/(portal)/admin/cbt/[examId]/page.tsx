"use client"

import { FormEvent, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, FileQuestion, Plus, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CbtAPI, CbtQuestionType } from "@/lib/cbt"

const QUESTION_TYPES: Array<{ value: CbtQuestionType; label: string }> = [
  { value: "mcq", label: "Multiple choice" },
  { value: "multiple_response", label: "Multiple response" },
  { value: "true_false", label: "True or false" },
  { value: "short_answer", label: "Short answer" },
  { value: "essay", label: "Essay" },
]

export default function CbtExamBuilderPage() {
  const { examId } = useParams<{ examId: string }>()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [type, setType] = useState<CbtQuestionType>("mcq")
  const [optionsText, setOptionsText] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const exam = useQuery({
    queryKey: ["cbt", "manage", "exam", examId],
    queryFn: () => CbtAPI.getExam(examId),
  })
  const attempts = useQuery({
    queryKey: ["cbt", "manage", "exam", examId, "attempts"],
    queryFn: () => CbtAPI.getExamAttempts(examId),
    enabled: exam.data?.status === "published",
  })
  const optionLines = useMemo(
    () =>
      optionsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [optionsText]
  )
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["cbt", "manage"] })
  }
  const addQuestion = useMutation({
    mutationFn: (data: Record<string, unknown>) => CbtAPI.addQuestion(examId, data),
    onSuccess: () => {
      refresh()
      setDialogOpen(false)
      setOptionsText("")
      setCorrectAnswer("")
      toast.success("Question added")
    },
    onError: (error: Error) => toast.error(error.message || "Could not add question"),
  })
  const publish = useMutation({
    mutationFn: () => CbtAPI.publishExam(examId),
    onSuccess: () => {
      refresh()
      toast.success("Examination published")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not publish examination"),
  })

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const options = optionLines.map((text, index) => ({
      id: `option-${index + 1}`,
      text,
    }))
    const needsOptions = type === "mcq" || type === "multiple_response"
    const answer =
      type === "multiple_response"
        ? JSON.stringify(
            correctAnswer
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        : correctAnswer
    addQuestion.mutate({
      type,
      body: String(form.get("body") || ""),
      marks: Number(form.get("marks")),
      topic: String(form.get("topic") || "") || undefined,
      difficulty: String(form.get("difficulty") || "medium"),
      options: needsOptions ? options : undefined,
      correctAnswer: type === "essay" ? undefined : answer,
      sortOrder: exam.data?.questions?.length ?? 0,
    })
  }

  if (exam.isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    )
  if (!exam.data)
    return (
      <div className="p-6 text-sm text-slate-600">Examination could not be loaded.</div>
    )

  const isDraft = exam.data.status === "draft"
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={
            exam.data.examType === "entrance"
              ? "/admin/cbt/external"
              : "/admin/cbt/internal"
          }
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" /> Back to examinations
        </Link>
        <header className="rounded-2xl border bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isDraft ? "secondary" : "default"}>
                  {exam.data.status}
                </Badge>
                <span className="text-sm text-slate-500">
                  {exam.data.timeLimitMinutes} minutes
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold">{exam.data.name}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                {exam.data.instructions || "No instructions have been added."}
              </p>
            </div>
            {isDraft && (
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      "Publish this examination? Questions can no longer be edited afterwards."
                    )
                  )
                    publish.mutate()
                }}
                disabled={publish.isPending || !exam.data.questions?.length}
              >
                <Send className="mr-2 h-4 w-4" /> Publish
              </Button>
            )}
          </div>
          <div className="mt-5 grid gap-3 border-t pt-5 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Questions</p>
              <p className="font-semibold">{exam.data.questions?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-slate-500">
                {exam.data.examType === "entrance" ? "Proctoring" : "Classes"}
              </p>
              <p className="font-semibold">
                {exam.data.examType === "entrance"
                  ? exam.data.proctoringMode.replace("_", " ")
                  : (exam.data.classes?.length ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Pass mark</p>
              <p className="font-semibold">
                {exam.data.passMarkPercent ?? "Not set"}
                {exam.data.passMarkPercent !== null ? "%" : ""}
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Questions</h2>
              <p className="text-sm text-slate-500">
                Review the complete paper before publishing.
              </p>
            </div>
            {isDraft && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add a question</DialogTitle>
                    <DialogDescription>
                      Answer keys are never included in the student examination response.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-5" onSubmit={submitQuestion}>
                    <div className="space-y-2">
                      <Label htmlFor="type">Question type</Label>
                      <select
                        id="type"
                        value={type}
                        onChange={(event) => {
                          setType(event.target.value as CbtQuestionType)
                          setCorrectAnswer("")
                        }}
                        className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                      >
                        {QUESTION_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body">Question</Label>
                      <Textarea id="body" name="body" required className="min-h-28" />
                    </div>
                    {(type === "mcq" || type === "multiple_response") && (
                      <div className="space-y-2">
                        <Label htmlFor="options">Options, one per line</Label>
                        <Textarea
                          id="options"
                          value={optionsText}
                          onChange={(event) => setOptionsText(event.target.value)}
                          required
                          className="min-h-32"
                          placeholder={"First option\nSecond option\nThird option"}
                        />
                        <p className="text-xs text-slate-500">
                          Option IDs will be option-1, option-2 and so on.
                        </p>
                      </div>
                    )}
                    {type !== "essay" && (
                      <div className="space-y-2">
                        <Label htmlFor="correct">Correct answer</Label>
                        {type === "mcq" ? (
                          <select
                            id="correct"
                            value={correctAnswer}
                            onChange={(event) => setCorrectAnswer(event.target.value)}
                            required
                            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                          >
                            <option value="">Select the correct option</option>
                            {optionLines.map((line, index) => (
                              <option
                                key={`${index}-${line}`}
                                value={`option-${index + 1}`}
                              >
                                {line}
                              </option>
                            ))}
                          </select>
                        ) : type === "true_false" ? (
                          <select
                            id="correct"
                            value={correctAnswer}
                            onChange={(event) => setCorrectAnswer(event.target.value)}
                            required
                            className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                          >
                            <option value="">Choose</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : type === "multiple_response" ? (
                          <div className="space-y-2 rounded-lg border p-3">
                            {!optionLines.length && (
                              <p className="text-xs text-slate-500">
                                Add the answer options first.
                              </p>
                            )}
                            {optionLines.map((line, index) => {
                              const optionId = `option-${index + 1}`
                              const selected = correctAnswer.split(",").filter(Boolean)
                              return (
                                <label
                                  key={`${index}-${line}`}
                                  className="flex cursor-pointer items-center gap-3 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(optionId)}
                                    onChange={(event) =>
                                      setCorrectAnswer(
                                        event.target.checked
                                          ? [...selected, optionId].join(",")
                                          : selected
                                              .filter((id) => id !== optionId)
                                              .join(",")
                                      )
                                    }
                                  />
                                  {line}
                                </label>
                              )
                            })}
                          </div>
                        ) : (
                          <Input
                            id="correct"
                            value={correctAnswer}
                            onChange={(event) => setCorrectAnswer(event.target.value)}
                            required
                            placeholder="Expected answer"
                          />
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="marks">Marks</Label>
                        <Input
                          id="marks"
                          name="marks"
                          type="number"
                          min={0}
                          step="0.5"
                          defaultValue={1}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <select
                          id="difficulty"
                          name="difficulty"
                          defaultValue="medium"
                          className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input id="topic" name="topic" />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={
                        addQuestion.isPending ||
                        (type === "multiple_response" && !correctAnswer)
                      }
                    >
                      Add question
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!exam.data.questions?.length ? (
            <Card>
              <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
                <FileQuestion className="mb-3 h-8 w-8 text-slate-400" />
                <p className="font-semibold">No questions have been added</p>
                <p className="text-sm text-slate-500">
                  Add the first question to begin building this paper.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {exam.data.questions.map((question, index) => (
                <Card key={question.id} className="rounded-xl">
                  <CardContent className="flex gap-4 p-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {
                            QUESTION_TYPES.find((item) => item.value === question.type)
                              ?.label
                          }
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {Number(question.marks)} marks
                        </span>
                        {question.correctAnswer && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Answer key set
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-6 font-medium whitespace-pre-wrap">
                        {question.body}
                      </p>
                      {question.options?.length ? (
                        <ol className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <li key={option.id}>
                              {option.id.replace("option-", "")}. {option.text}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {!isDraft && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Participation and results</h2>
              <p className="text-sm text-slate-500">
                Track ongoing attempts without exposing answers or interrupting students.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Started", attempts.data?.summary.started ?? 0],
                ["In progress", attempts.data?.summary.inProgress ?? 0],
                ["Submitted", attempts.data?.summary.submitted ?? 0],
                ["Pending marking", attempts.data?.summary.pendingMarking ?? 0],
                [
                  "Average",
                  attempts.data?.summary.averagePercent === null ||
                  attempts.data?.summary.averagePercent === undefined
                    ? "—"
                    : `${attempts.data.summary.averagePercent}%`,
                ],
              ].map(([label, value]) => (
                <Card key={label} className="rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Answered</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attempts.data?.attempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {attempt.studentName || "Unknown student"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {attempt.registrationNumber || "No registration number"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              attempt.status === "submitted" ? "secondary" : "outline"
                            }
                          >
                            {attempt.status === "submitted" ? "Submitted" : "In progress"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{attempt.answeredQuestions}</td>
                        <td className="px-4 py-3 font-medium">
                          {attempt.manualGradingRequired
                            ? "Pending marking"
                            : attempt.percentage === null
                              ? "—"
                              : `${attempt.percentage}%`}
                        </td>
                        <td className="px-4 py-3">
                          {attempt.status === "submitted" ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/cbt/attempts/${attempt.id}`}>
                                {attempt.manualGradingRequired
                                  ? "Mark answers"
                                  : attempt.resultPublishedAt
                                    ? "View result"
                                    : "Review result"}
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">In progress</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!attempts.isLoading && !attempts.data?.attempts.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                          No student has started this examination.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </div>
    </main>
  )
}
