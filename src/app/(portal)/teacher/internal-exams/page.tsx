"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CbtAPI } from "@/lib/cbt"
import { useAcademicPeriod } from "@/hooks/use-academic-period"

export default function TeacherInternalExamsPage() {
  const router = useRouter()
  const period = useAcademicPeriod("teacher-internal-exams")
  const [assignment, setAssignment] = useState("")
  const options = useQuery({
    queryKey: ["cbt", "teacher", "exam-options"],
    queryFn: CbtAPI.teacherExamOptions,
  })
  const exams = useQuery({
    queryKey: ["cbt", "teacher", "managed-exams"],
    queryFn: CbtAPI.listTeacherManagedExams,
  })
  const create = useMutation({
    mutationFn: CbtAPI.createTeacherExam,
    onSuccess: (exam) => {
      toast.success("Draft exam created")
      router.push(`/teacher/internal-exams/${exam.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const selected = options.data?.find(
    (item) => `${item.classId}:${item.subjectId}` === assignment
  )
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || selected.sessionId !== period.sessionId) return
    const form = new FormData(event.currentTarget)
    create.mutate({
      name: String(form.get("name") || "").trim(),
      examType: "in_school",
      sessionId: period.sessionId,
      termId: period.termId,
      subjectId: selected.subjectId,
      classIds: [selected.classId],
      timeLimitMinutes: Number(form.get("duration")),
      maxAttempts: 1,
      proctoringMode: String(form.get("proctoring") || "none"),
    })
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="portal-section-label mb-2">Assessments</p>
        <h1 className="text-3xl font-semibold">Internal exams</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Prepare questions for a subject you teach. An admin reviews and publishes the
          exam.
        </p>
      </header>
      <AcademicPeriodSelector scope="teacher-internal-exams" />
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Create a draft</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="exam-name">Exam name</Label>
              <Input id="exam-name" name="name" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-assignment">Your class and subject</Label>
              <select
                id="exam-assignment"
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                value={assignment}
                onChange={(event) => setAssignment(event.target.value)}
                required
              >
                <option value="">Select assigned subject</option>
                {options.data
                  ?.filter((item) => item.sessionId === period.sessionId)
                  .map((item) => (
                    <option
                      key={`${item.classId}:${item.subjectId}`}
                      value={`${item.classId}:${item.subjectId}`}
                    >
                      {item.className} {item.arm ?? ""} · {item.subjectName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Duration (minutes)</Label>
              <Input
                id="exam-duration"
                name="duration"
                type="number"
                min={1}
                max={1440}
                defaultValue={60}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-proctoring">Proctoring</Label>
              <select
                id="exam-proctoring"
                name="proctoring"
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
              >
                <option value="none">None</option>
                <option value="recorded">Screen recording</option>
                <option value="both">Live proctor and screen recording</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={!selected || create.isPending || !period.sessionId}
              >
                {create.isPending ? "Creating…" : "Create draft"}
              </Button>
            </div>
          </form>
          {options.isError && (
            <p className="mt-3 text-sm text-red-700">
              Assigned subjects could not be loaded.
            </p>
          )}
          {!options.isLoading && !options.data?.length && (
            <p className="mt-3 text-sm text-amber-700">
              No assigned subjects are available for the current session.
            </p>
          )}
        </CardContent>
      </Card>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your exams</h2>
        {exams.isError && (
          <p className="text-sm text-red-700">Exams could not be loaded.</p>
        )}
        {!exams.isLoading && !exams.data?.length && (
          <p className="text-muted-foreground text-sm">No exams created yet.</p>
        )}
        {exams.data?.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{exam.name}</p>
                <Badge variant="outline" className="mt-2">
                  {exam.status}
                </Badge>
              </div>
              <Button asChild variant="outline">
                <Link href={`/teacher/internal-exams/${exam.id}`}>Open exam</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
