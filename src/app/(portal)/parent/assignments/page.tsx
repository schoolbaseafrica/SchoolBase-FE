"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, CalendarClock, CheckCircle2 } from "lucide-react"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { AssignmentAttachments } from "@/components/assignments/assignment-attachments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AssignmentAPI, type Assignment } from "@/lib/assignments"

import { useParentStudents } from "../_components/student-provider"
import { StudentSelector } from "../_components/student-selector"

type Filter = "all" | "due" | "overdue" | "submitted" | "graded"

const stateFor = (assignment: Assignment) => {
  const submission = assignment.submissions[0]
  if (submission?.status === "graded") return "graded"
  if (submission?.status === "submitted") return submission.isLate ? "late" : "submitted"
  if (assignment.dueAt && new Date(assignment.dueAt) < new Date()) return "overdue"
  if (
    assignment.dueAt &&
    new Date(assignment.dueAt).getTime() <= new Date().getTime() + 24 * 60 * 60 * 1000
  )
    return "due soon"
  return submission?.status ?? "due"
}

export default function ParentAssignmentsPage() {
  const { studentID, selectedStudent } = useParentStudents()
  const period = useAcademicPeriod("parent-assignments")
  const [filter, setFilter] = useState<Filter>("all")
  const assignments = useQuery({
    queryKey: ["parent-assignments", studentID, period.sessionId, period.termId],
    queryFn: () =>
      AssignmentAPI.parentList(studentID!, {
        session_id: period.sessionId,
        term_id: period.termId,
      }),
    enabled: Boolean(studentID && period.sessionId),
  })
  const allRows = useMemo(() => assignments.data ?? [], [assignments.data])
  const rows = useMemo(
    () =>
      allRows.filter((assignment) => {
        const state = stateFor(assignment)
        if (filter === "due")
          return ["due", "due soon", "draft", "returned"].includes(state)
        if (filter === "submitted") return ["submitted", "late"].includes(state)
        return filter === "all" || state === filter
      }),
    [allRows, filter]
  )
  const counts = useMemo(
    () => ({
      due: allRows.filter((item) =>
        ["due", "due soon", "draft", "returned"].includes(stateFor(item))
      ).length,
      overdue: allRows.filter((item) => stateFor(item) === "overdue").length,
      submitted: allRows.filter((item) => ["submitted", "late"].includes(stateFor(item)))
        .length,
      graded: allRows.filter((item) => stateFor(item) === "graded").length,
    }),
    [allRows]
  )

  return (
    <section className="min-h-screen bg-[#fafafa] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Assignments</h1>
            <p className="text-muted-foreground text-sm">
              Track {selectedStudent?.full_name ?? "your child"}&apos;s class work and
              feedback.
            </p>
          </div>
          <StudentSelector className="w-full sm:w-auto sm:min-w-[220px]" />
        </div>
        <AcademicPeriodSelector scope="parent-assignments" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(counts).map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-white p-3 shadow-sm">
              <p className="text-muted-foreground text-xs capitalize">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "due", "overdue", "submitted", "graded"] as Filter[]).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className="capitalize"
              onClick={() => setFilter(value)}
            >
              {value}
            </Button>
          ))}
        </div>
        {assignments.isLoading ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            Loading assignments…
          </div>
        ) : assignments.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p>Assignments could not be loaded.</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => assignments.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((assignment) => (
              <ParentAssignmentCard
                key={assignment.id}
                assignment={assignment}
                studentId={studentID!}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="font-medium">No assignments here</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ParentAssignmentCard({
  assignment,
  studentId,
}: {
  assignment: Assignment
  studentId: string
}) {
  const [open, setOpen] = useState(false)
  const submission = assignment.submissions[0]
  const state = stateFor(assignment)
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <button
        type="button"
        className="grid w-full gap-3 p-4 text-left sm:grid-cols-[1fr_auto] sm:items-center"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{assignment.title}</h2>
            <Badge
              variant={state === "overdue" ? "destructive" : "secondary"}
              className="capitalize"
            >
              {state}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {assignment.subject.name} · {assignment.classroom.name}{" "}
            {assignment.classroom.arm ?? ""}
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4" />
          {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : "No due date"}
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <p className="text-sm whitespace-pre-wrap">{assignment.instructions}</p>
          <AssignmentAttachments
            assignmentId={assignment.id}
            studentId={studentId}
            canUpload={false}
          />
          {submission?.status === "graded" && (
            <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                {submission.marksAwarded} / {assignment.totalMarks}
              </p>
              <p className="mt-2 text-sm">
                {submission.feedback || "No written feedback."}
              </p>
            </div>
          )}
          {submission?.submittedAt && (
            <p className="text-muted-foreground text-xs">
              Submitted {new Date(submission.submittedAt).toLocaleString()}
              {submission.isLate ? " · Late" : ""}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
