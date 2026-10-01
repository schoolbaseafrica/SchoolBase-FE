"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, Download } from "lucide-react"

import { AssignmentAPI, type Assignment } from "@/lib/assignments"
import { Button } from "@/components/ui/button"

const statuses = ["all", "missing", "draft", "submitted", "late", "graded", "returned"]

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`

export function AssignmentReportPanel({
  sessionId,
  termId,
  assignments,
}: {
  sessionId?: string
  termId?: string
  assignments: Assignment[]
}) {
  const [open, setOpen] = useState(false)
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [status, setStatus] = useState("all")
  const classes = useMemo(
    () => [
      ...new Map(assignments.map((item) => [item.classroom.id, item.classroom])).values(),
    ],
    [assignments]
  )
  const subjects = useMemo(
    () => [
      ...new Map(
        assignments
          .filter((item) => !classId || item.classroom.id === classId)
          .map((item) => [item.subject.id, item.subject])
      ).values(),
    ],
    [assignments, classId]
  )
  const report = useQuery({
    queryKey: ["assignment-report", sessionId, termId, classId, subjectId, status],
    queryFn: () =>
      AssignmentAPI.report({
        session_id: sessionId,
        term_id: termId,
        class_id: classId || undefined,
        subject_id: subjectId || undefined,
        status,
      }),
    enabled: open && Boolean(sessionId),
  })
  const exportCsv = () => {
    if (!report.data) return
    const headings = [
      "Assignment",
      "Class",
      "Subject",
      "Student",
      "Registration number",
      "Status",
      "Due at",
      "Submitted at",
      "Marks",
      "Total marks",
    ]
    const lines = [
      headings.map(csvCell).join(","),
      ...report.data.rows.map((row) =>
        [
          row.assignment,
          row.className,
          row.subject,
          row.student,
          row.registrationNumber,
          row.status,
          row.dueAt,
          row.submittedAt,
          row.marksAwarded,
          row.totalMarks,
        ]
          .map(csvCell)
          .join(",")
      ),
    ]
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `assignment-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-5 w-5 text-red-600" /> Class-work report
        </span>
        <span className="text-muted-foreground text-sm">{open ? "Hide" : "View"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              className="h-10 rounded-md border bg-white px-3"
              value={classId}
              onChange={(event) => {
                setClassId(event.target.value)
                setSubjectId("")
              }}
            >
              <option value="">All classes</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.arm ?? ""}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-white px-3"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">All subjects</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-white px-3 capitalize"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All statuses" : item}
                </option>
              ))}
            </select>
          </div>
          {report.isLoading ? (
            <p className="text-muted-foreground py-5 text-center text-sm">
              Loading report…
            </p>
          ) : report.isError ? (
            <div className="py-5 text-center text-sm text-red-700">
              Report could not be loaded.{" "}
              <button onClick={() => report.refetch()}>Retry</button>
            </div>
          ) : report.data ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  ["Records", report.data.summary.total],
                  ["Missing", report.data.summary.missing],
                  ["Submitted", report.data.summary.submitted],
                  ["Late", report.data.summary.late],
                  ["Graded", report.data.summary.graded],
                  [
                    "Average",
                    report.data.summary.averagePercentage === null
                      ? "—"
                      : `${report.data.summary.averagePercentage}%`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={exportCsv}
                  disabled={!report.data.rows.length}
                >
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      {[
                        "Student",
                        "Assignment",
                        "Class",
                        "Subject",
                        "Status",
                        "Score",
                      ].map((item) => (
                        <th key={item} className="px-3 py-2 font-medium">
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.rows.map((row) => (
                      <tr
                        key={`${row.assignmentId}-${row.studentId}`}
                        className="border-t"
                      >
                        <td className="px-3 py-2">
                          {row.student}
                          <span className="text-muted-foreground block text-xs">
                            {row.registrationNumber}
                          </span>
                        </td>
                        <td className="px-3 py-2">{row.assignment}</td>
                        <td className="px-3 py-2">{row.className}</td>
                        <td className="px-3 py-2">{row.subject}</td>
                        <td className="px-3 py-2 capitalize">{row.status}</td>
                        <td className="px-3 py-2">
                          {row.marksAwarded === null
                            ? "—"
                            : `${row.marksAwarded}/${row.totalMarks}`}
                        </td>
                      </tr>
                    ))}
                    {!report.data.rows.length && (
                      <tr>
                        <td colSpan={6} className="text-muted-foreground p-6 text-center">
                          No matching records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
