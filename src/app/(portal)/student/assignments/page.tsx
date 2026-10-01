"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Save,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { AssignmentAttachments } from "@/components/assignments/assignment-attachments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AssignmentAPI, type Assignment } from "@/lib/assignments"

type Filter = "all" | "todo" | "submitted" | "graded"

export default function StudentAssignmentsPage() {
  const period = useAcademicPeriod("student-assignments")
  const [filter, setFilter] = useState<Filter>("all")
  const assignments = useQuery({
    queryKey: ["assignments", "student", period.sessionId, period.termId],
    queryFn: () =>
      AssignmentAPI.list({ session_id: period.sessionId, term_id: period.termId }),
    enabled: Boolean(period.sessionId),
  })
  const rows = useMemo(
    () =>
      (assignments.data ?? []).filter((assignment) => {
        const status = assignment.submissions[0]?.status
        if (filter === "todo")
          return !status || status === "draft" || status === "returned"
        if (filter === "submitted") return status === "submitted"
        if (filter === "graded") return status === "graded"
        return true
      }),
    [assignments.data, filter]
  )

  return (
    <section className="min-h-screen bg-[#fafafa] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          <p className="text-muted-foreground text-sm">
            View your class work, submit answers and read feedback.
          </p>
        </div>
        <AcademicPeriodSelector scope="student-assignments" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "todo", "submitted", "graded"] as Filter[]).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
              className="capitalize"
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
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="font-medium">No assignments here</p>
            <p className="text-muted-foreground text-sm">
              New work for this academic period will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((assignment) => (
              <StudentAssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function StudentAssignmentCard({ assignment }: { assignment: Assignment }) {
  const queryClient = useQueryClient()
  const submission = assignment.submissions[0]
  const [open, setOpen] = useState(false)
  const [responseText, setResponseText] = useState(submission?.responseText ?? "")
  const due = assignment.dueAt ? new Date(assignment.dueAt) : null
  const overdue = Boolean(
    due && due < new Date() && !["submitted", "graded"].includes(submission?.status ?? "")
  )
  const save = useMutation({
    mutationFn: (status: "draft" | "submitted") =>
      AssignmentAPI.saveSubmission(assignment.id, {
        responseText,
        status,
      }),
    onSuccess: (_, status) => {
      toast.success(status === "submitted" ? "Assignment submitted" : "Draft saved")
      queryClient.invalidateQueries({ queryKey: ["assignments"] })
    },
    onError: (error: Error) => toast.error(error.message || "Could not save your work"),
  })
  const status = submission?.status ?? "todo"
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <button
        className="grid w-full gap-3 p-4 text-left sm:grid-cols-[1fr_auto] sm:items-center"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{assignment.title}</h2>
            <Badge
              variant={status === "graded" ? "default" : "secondary"}
              className="capitalize"
            >
              {status}
            </Badge>
            {submission?.isLate && <Badge variant="destructive">Late</Badge>}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {assignment.subject.name} · {assignment.teacher.title ?? ""}{" "}
            {assignment.teacher.user?.first_name ?? ""}{" "}
            {assignment.teacher.user?.last_name ?? ""}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 text-sm ${overdue ? "text-red-600" : "text-muted-foreground"}`}
        >
          <CalendarClock className="h-4 w-4" />
          {due ? due.toLocaleString() : "No due date"}
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <div>
            <h3 className="text-sm font-medium">Instructions</h3>
            <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
              {assignment.instructions}
            </p>
          </div>
          {assignment.attachmentUrl && (
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open teacher resource
            </a>
          )}
          {submission?.status === "graded" ? (
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                {submission.marksAwarded} / {assignment.totalMarks}
              </div>
              <p className="mt-2 text-sm text-emerald-900">
                {submission.feedback || "No written feedback."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Your response</label>
                <Textarea
                  className="mt-1 min-h-36"
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  placeholder="Write your answer here…"
                />
              </div>
              <AssignmentAttachments
                assignmentId={assignment.id}
                canUpload={assignment.status === "published"}
              />
              {submission?.status === "returned" && submission.feedback && (
                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  <strong>Teacher feedback:</strong> {submission.feedback}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => save.mutate("draft")}
                  disabled={save.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save draft
                </Button>
                <Button
                  onClick={() => save.mutate("submitted")}
                  disabled={save.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submission?.status === "submitted" ? "Resubmit" : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
