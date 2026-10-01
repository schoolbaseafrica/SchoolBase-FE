"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Plus,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { AssignmentAttachments } from "@/components/assignments/assignment-attachments"
import { AssignmentReportPanel } from "@/components/assignments/assignment-report-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AssignmentAPI, type Assignment, type AssignmentStatus } from "@/lib/assignments"
import { TeacherAttendanceAPI } from "@/lib/teacher-attendance"

const statusStyle: Record<AssignmentStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
  archived: "bg-gray-100 text-gray-500",
}

export default function TeacherAssignmentsPage() {
  const period = useAcademicPeriod("teacher-assignments")
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [form, setForm] = useState({
    title: "",
    instructions: "",
    subjectId: "",
    dueAt: "",
    totalMarks: "100",
  })

  const assignments = useQuery({
    queryKey: ["assignments", "teacher", period.sessionId, period.termId, showArchived],
    queryFn: () =>
      AssignmentAPI.list({
        session_id: period.sessionId,
        term_id: period.termId,
        include_archived: showArchived,
      }),
    enabled: Boolean(period.sessionId),
  })
  const classes = useQuery({
    queryKey: ["teacher-assignment-classes", period.sessionId],
    queryFn: () => TeacherAttendanceAPI.getAssignedClasses(period.sessionId),
    enabled: Boolean(period.sessionId),
  })
  const subjects = useQuery({
    queryKey: ["teacher-assignment-subjects", selectedClass],
    queryFn: () => AssignmentAPI.teacherSubjects(selectedClass),
    enabled: Boolean(selectedClass),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["assignments"] })
  const create = useMutation({
    mutationFn: () =>
      AssignmentAPI.create({
        title: form.title,
        instructions: form.instructions,
        classId: selectedClass,
        subjectId: form.subjectId,
        academicSessionId: period.sessionId!,
        academicTermId: period.termId,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        totalMarks: Number(form.totalMarks),
      }),
    onSuccess: () => {
      toast.success("Assignment draft created")
      setCreating(false)
      setForm({
        title: "",
        instructions: "",
        subjectId: "",
        dueAt: "",
        totalMarks: "100",
      })
      refresh()
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create assignment"),
  })
  const transition = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      AssignmentAPI.transition(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Assignment ${variables.status}`)
      refresh()
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not update assignment"),
  })
  const rows = useMemo(() => assignments.data ?? [], [assignments.data])

  return (
    <section className="min-h-screen bg-[#fafafa] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Assignments</h1>
            <p className="text-muted-foreground text-sm">
              Create, publish and grade class work.
            </p>
          </div>
          <Button onClick={() => setCreating((value) => !value)}>
            <Plus className="mr-2 h-4 w-4" />
            New assignment
          </Button>
        </div>
        <AcademicPeriodSelector scope="teacher-assignments" />
        <AssignmentReportPanel
          sessionId={period.sessionId}
          termId={period.termId}
          assignments={assignments.data ?? []}
        />
        {creating && (
          <form
            className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate()
            }}
          >
            <div>
              <label className="text-sm font-medium">Class</label>
              <select
                className="mt-1 h-10 w-full rounded-md border bg-white px-3"
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value)
                  setForm((old) => ({ ...old, subjectId: "" }))
                }}
                required
              >
                <option value="">Select class</option>
                {classes.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.arm}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <select
                className="mt-1 h-10 w-full rounded-md border bg-white px-3"
                value={form.subjectId}
                onChange={(event) => setForm({ ...form, subjectId: event.target.value })}
                required
                disabled={!selectedClass || subjects.isLoading || subjects.isError}
              >
                <option value="">
                  {!selectedClass
                    ? "Select a class first"
                    : subjects.isLoading
                      ? "Loading subjects…"
                      : subjects.isError
                        ? "Could not load subjects"
                        : subjects.data?.length
                          ? "Select subject"
                          : "No subjects assigned"}
                </option>
                {subjects.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {subjects.isError && (
                <button
                  type="button"
                  className="mt-1 text-sm text-red-600 underline"
                  onClick={() => subjects.refetch()}
                >
                  Retry loading subjects
                </button>
              )}
              {selectedClass &&
                !subjects.isLoading &&
                !subjects.isError &&
                subjects.data?.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    No subject is assigned to you for this class or its timetable.
                  </p>
                )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                minLength={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                className="mt-1 min-h-28"
                value={form.instructions}
                onChange={(event) =>
                  setForm({ ...form, instructions: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Due date and time</label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total marks</label>
              <Input
                className="mt-1"
                type="number"
                min="1"
                max="10000"
                value={form.totalMarks}
                onChange={(event) => setForm({ ...form, totalMarks: event.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Save draft"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setShowArchived((value) => !value)}>
            {showArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
        {assignments.isLoading ? (
          <p className="rounded-2xl border bg-white p-8 text-center">
            Loading assignments…
          </p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-3 h-9 w-9" />
            <p className="font-medium">No assignments in this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onTransition={(status) =>
                  transition.mutate({ id: assignment.id, status })
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AssignmentRow({
  assignment,
  onTransition,
}: {
  assignment: Assignment
  onTransition: (status: AssignmentStatus) => void
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  return (
    <article className="rounded-2xl border bg-white shadow-sm">
      <button
        className="grid w-full gap-3 p-4 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{assignment.title}</h2>
            <Badge className={statusStyle[assignment.status]}>{assignment.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {assignment.subject.name} · {assignment.classroom.name}{" "}
            {assignment.classroom.arm ?? ""}
          </p>
        </div>
        <p className="text-sm">
          Due{" "}
          {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : "any time"}
        </p>
        <p className="text-sm font-medium">
          {assignment.submissions.filter((item) => item.status !== "draft").length}{" "}
          submissions
        </p>
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <p className="text-sm whitespace-pre-wrap">{assignment.instructions}</p>
          <AssignmentAttachments
            assignmentId={assignment.id}
            canUpload={assignment.status === "draft"}
          />
          <div className="flex flex-wrap gap-2">
            {assignment.status === "draft" && (
              <Button size="sm" onClick={() => onTransition("published")}>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {assignment.status === "published" && (
              <Button size="sm" variant="outline" onClick={() => onTransition("closed")}>
                <XCircle className="mr-2 h-4 w-4" />
                Close submissions
              </Button>
            )}
            {assignment.status === "closed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTransition("published")}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reopen
              </Button>
            )}
            {assignment.status !== "archived" && (
              <Button size="sm" variant="ghost" onClick={() => onTransition("archived")}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
            {assignment.status === "archived" && (
              <Button size="sm" variant="outline" onClick={() => onTransition("closed")}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </Button>
            )}
          </div>
          {assignment.submissions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Student work</h3>
              {assignment.submissions.map((submission) => (
                <GradeRow
                  key={submission.id}
                  assignment={assignment}
                  submission={submission}
                  onSaved={() =>
                    queryClient.invalidateQueries({ queryKey: ["assignments"] })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function GradeRow({
  assignment,
  submission,
  onSaved,
}: {
  assignment: Assignment
  submission: Assignment["submissions"][number]
  onSaved: () => void
}) {
  const [marks, setMarks] = useState(submission.marksAwarded?.toString() ?? "")
  const [feedback, setFeedback] = useState(submission.feedback ?? "")
  const mutation = useMutation({
    mutationFn: () =>
      AssignmentAPI.grade(assignment.id, submission.id, {
        marksAwarded: Number(marks),
        feedback,
        status: "graded",
      }),
    onSuccess: () => {
      toast.success("Grade saved")
      onSaved()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const name =
    `${submission.student.user?.first_name ?? ""} ${submission.student.user?.last_name ?? ""}`.trim() ||
    submission.student.registration_number
  return (
    <div className="grid gap-3 rounded-xl bg-slate-50 p-3 lg:grid-cols-[1fr_100px_2fr_auto] lg:items-end">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">
          {submission.status}
          {submission.isLate ? " · Late" : ""}
        </p>
        <p className="mt-2 text-sm whitespace-pre-wrap">
          {submission.responseText || "Attachment submission"}
        </p>
        {submission.attachmentUrl && (
          <a
            className="text-sm text-red-600 underline"
            href={submission.attachmentUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open attachment
          </a>
        )}
      </div>
      <div>
        <label className="text-xs">Marks / {assignment.totalMarks}</label>
        <Input
          type="number"
          min="0"
          max={assignment.totalMarks}
          value={marks}
          onChange={(event) => setMarks(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs">Feedback</label>
        <Input value={feedback} onChange={(event) => setFeedback(event.target.value)} />
      </div>
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={!marks || mutation.isPending}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Grade
      </Button>
    </div>
  )
}
