"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GradeSubmission } from "@/types/result"
import { SubmissionsGrid } from "./submissions-grid"

type SubmissionGroup = {
  id: string
  label: string
  submissions: GradeSubmission[]
}

function classLabel(submission: GradeSubmission) {
  const name = submission.class?.name?.trim() || "Unassigned class"
  const arm = submission.class?.arm?.trim()
  return arm ? `${name} ${arm}` : name
}

function streamLabel(submission: GradeSubmission) {
  return submission.class?.stream?.trim() || submission.class?.name?.trim() || "Other"
}

function groupBy(
  submissions: GradeSubmission[],
  getId: (submission: GradeSubmission) => string,
  getLabel: (submission: GradeSubmission) => string
) {
  const groups = new Map<string, SubmissionGroup>()
  submissions.forEach((submission) => {
    const id = getId(submission)
    const group = groups.get(id) || { id, label: getLabel(submission), submissions: [] }
    group.submissions.push(submission)
    groups.set(id, group)
  })
  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function GroupCard({
  group,
  level,
  onOpen,
}: {
  group: SubmissionGroup
  level: "stream" | "class"
  onOpen: () => void
}) {
  const pending = group.submissions.filter((item) => item.status === "submitted").length
  const approved = group.submissions.filter((item) => item.status === "approved").length
  const rejected = group.submissions.filter((item) => item.status === "rejected").length
  const subjects = new Set(
    group.submissions.map((item) => item.subject?.id || item.subject_id)
  )
  const classes = new Set(
    group.submissions.map((item) => item.class?.id || item.class_id)
  )
  const students = Math.max(
    0,
    ...group.submissions.map((item) => item.student_count || item.grades?.length || 0)
  )

  return (
    <Card className="group transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              {level === "stream" ? "Stream" : "Class"}
            </p>
            <CardTitle className="mt-1 text-lg">{group.label}</CardTitle>
          </div>
          {pending > 0 && <Badge variant="outline">{pending} pending</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900">{students}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {level === "stream" ? classes.size : subjects.size}
            </p>
            <p className="text-xs text-gray-500">
              {level === "stream" ? "Classes" : "Subjects"}
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {group.submissions.length}
            </p>
            <p className="text-xs text-gray-500">Submissions</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">
            {approved} approved
          </span>
          {rejected > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
              {rejected} returned
            </span>
          )}
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onOpen}>
          View {level === "stream" ? "classes" : "submissions"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function ResultsHierarchy({
  submissions,
  isLoading,
  isError = false,
}: {
  submissions: GradeSubmission[]
  isLoading: boolean
  isError?: boolean
}) {
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const streams = useMemo(
    () => groupBy(submissions, (item) => streamLabel(item), streamLabel),
    [submissions]
  )
  const stream = streams.find((item) => item.id === selectedStream)
  const classes = useMemo(
    () =>
      groupBy(
        stream?.submissions || [],
        (item) => item.class?.id || item.class_id || classLabel(item),
        classLabel
      ),
    [stream]
  )
  const selectedClassGroup = classes.find((item) => item.id === selectedClass)

  if (isLoading) return <SubmissionsGrid submissions={[]} isLoading />

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <h3 className="mt-3 font-semibold text-red-900">Could not load results</h3>
        <p className="mt-1 text-sm text-red-700">
          Refresh the page to try again. Your result records have not been changed.
        </p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return <SubmissionsGrid submissions={[]} isLoading={false} />
  }

  if (stream && selectedClassGroup) {
    return (
      <div className="space-y-5">
        <Button type="button" variant="ghost" onClick={() => setSelectedClass(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {stream.label}
        </Button>
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold">{selectedClassGroup.label}</h2>
            <p className="text-sm text-gray-500">
              Review submissions by subject and teacher.
            </p>
          </div>
        </div>
        <SubmissionsGrid submissions={selectedClassGroup.submissions} isLoading={false} />
      </div>
    )
  }

  if (stream) {
    return (
      <div className="space-y-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSelectedStream(null)
            setSelectedClass(null)
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to streams
        </Button>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold">{stream.label}</h2>
            <p className="text-sm text-gray-500">
              Choose a class to inspect its results.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              level="class"
              onOpen={() => setSelectedClass(group.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-6 w-6 text-gray-500" />
        <div>
          <h2 className="text-xl font-semibold">Results by stream</h2>
          <p className="text-sm text-gray-500">
            Start with a stream, then narrow the review to a class and subject.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {streams.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            level="stream"
            onOpen={() => setSelectedStream(group.id)}
          />
        ))}
      </div>
    </div>
  )
}
