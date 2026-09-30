"use client"

import { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProctorCameraMonitoring } from "@/components/cbt/cbt-camera-monitoring"
import { CbtAPI } from "@/lib/cbt"

export default function TeacherCbtMonitorPage() {
  const { examId } = useParams<{ examId: string }>()
  const client = useQueryClient()
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const monitor = useQuery({
    queryKey: ["cbt", "proctor", examId],
    queryFn: () => CbtAPI.getProctorExamAttempts(examId),
    refetchInterval: 15_000,
  })
  const exams = useQuery({
    queryKey: ["cbt", "proctor", "exams"],
    queryFn: CbtAPI.listProctorExams,
  })
  const currentExam = exams.data?.find((exam) => exam.id === examId)
  const getCameraToken = useCallback(
    () => CbtAPI.createProctorMediaToken(examId),
    [examId]
  )
  const activity = useQuery({
    queryKey: ["cbt", "proctor", "activity", attemptId],
    queryFn: () => CbtAPI.getProctorAttemptActivity(attemptId!),
    enabled: Boolean(attemptId),
  })
  const acknowledge = useMutation({
    mutationFn: CbtAPI.acknowledgeProctorEvent,
    onSuccess: () =>
      void client.invalidateQueries({
        queryKey: ["cbt", "proctor", "activity", attemptId],
      }),
  })
  const summary = monitor.data?.summary
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Live examination monitor</h1>
          <p className="text-sm text-slate-500">
            Refreshes every 15 seconds. Browser and connection signals are review aids;
            camera, microphone and screen are not recorded.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 self-start">
          <Link href="/teacher/cbt">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit monitor
          </Link>
        </Button>
      </div>
      {(currentExam?.proctoringMode === "human" ||
        currentExam?.proctoringMode === "both") && (
        <ProctorCameraMonitoring getToken={getCameraToken} />
      )}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Not started", summary?.notStarted ?? 0],
          ["In progress", summary?.inProgress ?? 0],
          ["Submitted", summary?.submitted ?? 0],
          ["Awaiting marking", summary?.pendingMarking ?? 0],
          ["Needs attention", summary?.flagged ?? 0],
          ["Completion", `${summary?.completionRate ?? 0}%`],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">State</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Last activity</th>
                <th className="p-3">Warnings</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monitor.data?.candidates.map((item) => (
                <tr key={item.id}>
                  <td className="p-3">
                    <p className="font-medium">{item.studentName}</p>
                    <p className="text-xs text-slate-500">{item.registrationNumber}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">
                      {item.status === "not_started"
                        ? "Not started"
                        : item.status === "submitted"
                          ? "Submitted"
                          : item.connectionState === "offline"
                            ? "Offline / reconnecting"
                            : "Online"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {item.answeredQuestions}/{item.questionCount}
                  </td>
                  <td className="p-3 text-xs">
                    {item.startedAt
                      ? new Date(
                          item.lastEventAt ?? item.lastSavedAt ?? item.startedAt
                        ).toLocaleString()
                      : "No activity yet"}
                    <br />
                    {item.status === "in_progress" &&
                      item.deadlineAt &&
                      `Due ${new Date(item.deadlineAt).toLocaleTimeString()}`}
                  </td>
                  <td className="p-3 text-xs">
                    {item.connectionLostCount} disconnects · {item.visibilityHiddenCount}{" "}
                    page exits
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={item.status === "not_started"}
                      onClick={() => setAttemptId(item.id)}
                    >
                      Activity
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {attemptId && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setAttemptId(null)}
        >
          <aside
            className="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Browser activity</h2>
                <p className="text-sm text-slate-500">{activity.data?.candidateName}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setAttemptId(null)}>
                <X />
              </Button>
            </div>
            <p className="my-4 text-xs text-slate-500">
              Connection and page-visibility events only. No camera, microphone or screen
              recording.
            </p>
            <div className="space-y-3">
              {activity.data?.events.map((event) => {
                const acknowledged = Boolean(event.metadata?.acknowledgedAt)
                return (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <p className="font-medium">
                        {event.eventType.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                      {acknowledged ? (
                        <Badge className="mt-2" variant="secondary">
                          Acknowledged
                        </Badge>
                      ) : (
                        <Button
                          className="mt-3"
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledge.mutate(event.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
