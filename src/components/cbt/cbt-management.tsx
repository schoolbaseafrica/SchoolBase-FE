"use client"

import { FormEvent, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookOpenCheck, Clock, FileQuestion, Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CbtAPI, CbtExamType, CbtProctoringMode } from "@/lib/cbt"
import { ClassesAPI } from "@/lib/classes"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export function CbtManagement({ examType }: { examType: CbtExamType }) {
  const external = examType === "entrance"
  const scope = external ? "admin-cbt-external" : "admin-cbt-internal"
  const period = useAcademicPeriod(scope)
  const periodParams = {
    sessionId: period.sessionId,
    termId: period.termId,
    scope: period.isWholeSession ? ("session" as const) : ("term" as const),
  }
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const exams = useQuery({
    queryKey: ["cbt", "manage", "exams", examType, periodParams],
    queryFn: () => CbtAPI.listExams(examType, periodParams),
    enabled: !!period.sessionId,
  })
  const classes = useQuery({
    queryKey: ["classes", "cbt-builder", period.sessionId],
    queryFn: () => ClassesAPI.getAll({ limit: 100, session_id: period.sessionId }),
    enabled: !external && !!period.sessionId,
  })
  const classOptions = useMemo(
    () =>
      (classes.data?.data.items ?? []).flatMap((group) =>
        group.classes.map((item) => ({
          id: item.id,
          label: `${group.name}${item.arm ? ` ${item.arm}` : ""}`,
        }))
      ),
    [classes.data]
  )
  const create = useMutation({
    mutationFn: CbtAPI.createExam,
    onSuccess: async (exam) => {
      await queryClient.invalidateQueries({ queryKey: ["cbt", "manage", "exams"] })
      setOpen(false)
      toast.success("Draft examination created")
      router.push(`/admin/cbt/${exam.id}`)
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create examination"),
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    create.mutate({
      name: String(form.get("name") || ""),
      instructions: String(form.get("instructions") || ""),
      timeLimitMinutes: Number(form.get("duration")),
      maxAttempts: Number(form.get("attempts")),
      passMarkPercent: Number(form.get("passMark")),
      classIds: selectedClasses,
      shuffleQuestions: true,
      shuffleOptions: true,
      showResultImmediately: false,
      examType,
      sessionId: period.sessionId,
      termId: period.termId,
      proctoringMode: String(form.get("proctoringMode")) as CbtProctoringMode,
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
              <BookOpenCheck className="h-4 w-4" /> Assessment workspace
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
              {external ? "External Exams" : "Internal Exams"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {external
                ? "Publish entrance tests for applicants and monitor their results."
                : "Build, schedule and monitor assessments for enrolled students."}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New examination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create an examination</DialogTitle>
                <DialogDescription>
                  Start with the delivery rules, then add and review questions before
                  publishing.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    maxLength={255}
                    placeholder="First term Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Explain what students should know before they begin."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Minutes</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min={1}
                      max={1440}
                      defaultValue={60}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Attempts</Label>
                    <Input
                      id="attempts"
                      name="attempts"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={1}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passMark">Pass mark %</Label>
                    <Input
                      id="passMark"
                      name="passMark"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={50}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proctoringMode">Proctoring</Label>
                  <select
                    id="proctoringMode"
                    name="proctoringMode"
                    defaultValue="none"
                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                  >
                    <option value="none">Not proctored</option>
                    <option value="human">Live proctor</option>
                    <option value="recorded">Recorded review</option>
                    <option value="both">Live and recorded</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    Live and recorded modes enable candidate integrity monitoring.
                  </p>
                </div>
                {!external && (
                  <div className="space-y-2">
                    <Label>Assigned classes</Label>
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
                      {classOptions.map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Checkbox
                            checked={selectedClasses.includes(item.id)}
                            onCheckedChange={(checked) =>
                              setSelectedClasses((current) =>
                                checked
                                  ? [...current, item.id]
                                  : current.filter((id) => id !== item.id)
                              )
                            }
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                      {!classes.isLoading && !classOptions.length && (
                        <p className="p-3 text-sm text-slate-500">
                          Create a class before scheduling an examination.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    create.isPending ||
                    !period.sessionId ||
                    (!external && !selectedClasses.length)
                  }
                >
                  Create draft
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>
        <AcademicPeriodSelector scope={scope} />

        {exams.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : !exams.data?.length ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <FileQuestion className="mb-3 h-9 w-9 text-slate-400" />
              <p className="font-semibold">No examinations yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create a draft and add its questions when you are ready.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams.data.map((exam) => (
              <Card key={exam.id} className="rounded-2xl shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <Badge
                      variant={exam.status === "published" ? "default" : "secondary"}
                    >
                      {exam.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5" />{" "}
                      {exam.questions?.length ?? exam.questionCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {exam.timeLimitMinutes}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />{" "}
                      {external ? exam.proctoringMode : (exam.classes?.length ?? 0)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/cbt/${exam.id}`)}
                  >
                    {exam.status === "draft" ? "Continue building" : "View examination"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
