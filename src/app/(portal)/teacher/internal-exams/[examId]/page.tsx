"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CbtAPI, CbtQuestion, CbtQuestionType } from "@/lib/cbt"

export default function TeacherInternalExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const client = useQueryClient()
  const [editing, setEditing] = useState<CbtQuestion | null>(null)
  const [type, setType] = useState<CbtQuestionType>("mcq")
  const exam = useQuery({
    queryKey: ["cbt", "teacher", "managed-exam", examId],
    queryFn: () => CbtAPI.getTeacherManagedExam(examId),
  })
  const refresh = () =>
    void client.invalidateQueries({
      queryKey: ["cbt", "teacher", "managed-exam", examId],
    })
  const saveQuestion = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing
        ? CbtAPI.updateTeacherExamQuestion(editing.id, data)
        : CbtAPI.addTeacherExamQuestion(examId, data),
    onSuccess: () => {
      toast.success(editing ? "Question updated" : "Question added")
      setEditing(null)
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const review = useMutation({
    mutationFn: () => CbtAPI.submitTeacherExamForReview(examId),
    onSuccess: () => {
      toast.success("Exam submitted for admin review")
      refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const optionTexts = String(form.get("options") || "")
      .split("\n")
      .map((text) => text.trim())
      .filter(Boolean)
    const options =
      type === "mcq"
        ? optionTexts.map((text, index) => ({ id: `option-${index + 1}`, text }))
        : undefined
    const correctIndex = Number(form.get("correctOption"))
    if (
      type === "mcq" &&
      (optionTexts.length < 2 || correctIndex < 1 || correctIndex > optionTexts.length)
    ) {
      toast.error("Add at least two options and select a valid correct option number")
      return
    }
    saveQuestion.mutate({
      type,
      body: String(form.get("body") || "").trim(),
      marks: Number(form.get("marks")),
      options,
      correctAnswer:
        type === "mcq"
          ? `option-${correctIndex}`
          : type === "essay"
            ? undefined
            : String(form.get("answer") || "").trim(),
      sortOrder: editing?.sortOrder ?? exam.data?.questions?.length ?? 0,
    })
  }
  const startEdit = (question: CbtQuestion) => {
    setEditing(question)
    setType(question.type)
    document.getElementById("question-editor")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Link href="/teacher/internal-exams" className="text-sm text-[var(--primary)]">
        ← All internal exams
      </Link>
      {exam.isLoading && <p className="text-muted-foreground">Loading exam…</p>}
      {exam.isError && (
        <p className="text-sm text-red-700">
          This exam could not be loaded or is outside your current assignment.
        </p>
      )}
      {exam.data && (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="outline">{exam.data.status}</Badge>
              <h1 className="mt-2 text-3xl font-semibold">{exam.data.name}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {exam.data.timeLimitMinutes} minutes · {exam.data.questions?.length ?? 0}{" "}
                questions
              </p>
            </div>
            {exam.data.status === "draft" && (
              <Button
                disabled={!exam.data.questions?.length || review.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      "Submit this exam for admin review? Questions cannot be edited during review."
                    )
                  )
                    review.mutate()
                }}
              >
                Submit for review
              </Button>
            )}
          </header>
          {exam.data.status === "draft" && (
            <Card id="question-editor">
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold">
                  {editing ? "Edit question" : "Add question"}
                </h2>
                <form
                  key={editing?.id ?? "new"}
                  className="space-y-4"
                  onSubmit={onSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question type</Label>
                    <select
                      id="question-type"
                      className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                      value={type}
                      disabled={Boolean(editing)}
                      onChange={(event) => setType(event.target.value as CbtQuestionType)}
                    >
                      <option value="mcq">Multiple choice</option>
                      <option value="true_false">True or false</option>
                      <option value="short_answer">Short answer</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-body">Question</Label>
                    <Textarea
                      id="question-body"
                      name="body"
                      defaultValue={editing?.body ?? ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-marks">Marks</Label>
                    <Input
                      id="question-marks"
                      name="marks"
                      type="number"
                      min={0.01}
                      step={0.01}
                      defaultValue={editing?.marks ?? 1}
                      required
                    />
                  </div>
                  {type === "mcq" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="question-options">Options, one per line</Label>
                        <Textarea
                          id="question-options"
                          name="options"
                          defaultValue={
                            editing?.options?.map((option) => option.text).join("\n") ??
                            ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="question-correct">Correct option number</Label>
                        <Input
                          id="question-correct"
                          name="correctOption"
                          type="number"
                          min={1}
                          max={12}
                          defaultValue={
                            editing?.correctAnswer?.replace("option-", "") ?? 1
                          }
                          required
                        />
                      </div>
                    </>
                  )}
                  {type === "true_false" && (
                    <div className="space-y-2">
                      <Label htmlFor="question-answer">Correct answer</Label>
                      <select
                        id="question-answer"
                        name="answer"
                        defaultValue={editing?.correctAnswer ?? "true"}
                        className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  )}
                  {type === "short_answer" && (
                    <div className="space-y-2">
                      <Label htmlFor="question-answer">Correct answer</Label>
                      <Input
                        id="question-answer"
                        name="answer"
                        defaultValue={editing?.correctAnswer ?? ""}
                        required
                      />
                    </div>
                  )}
                  {type === "essay" && (
                    <p className="text-muted-foreground text-sm">
                      Essay answers require manual marking.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button disabled={saveQuestion.isPending} type="submit">
                      {editing ? "Save changes" : "Add question"}
                    </Button>
                    {editing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(null)
                          setType("mcq")
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Questions</h2>
            {!exam.data.questions?.length && (
              <p className="text-muted-foreground text-sm">No questions yet.</p>
            )}
            {exam.data.questions?.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {index + 1}. {question.body}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {question.type.replaceAll("_", " ")} · {question.marks} marks
                    </p>
                  </div>
                  {exam.data?.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(question)}
                    >
                      Edit
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
