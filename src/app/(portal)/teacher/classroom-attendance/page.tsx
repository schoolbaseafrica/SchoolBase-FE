"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Download, Loader2, Radio, UserCheck } from "lucide-react"
import { toast } from "sonner"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CompactMetric,
  CompactMetricStrip,
  CompactRecordHeader,
  CompactRecordList,
  CompactRecordRow,
} from "@/components/ui/compact-record-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { useVirtualClassrooms } from "@/hooks/use-virtual-classroom"
import {
  ClassroomAttendanceStatus,
  ClassroomAttendanceStudent,
  VirtualClassroomAPI,
} from "@/lib/virtual-classroom"

const statuses: ClassroomAttendanceStatus[] = ["present", "late", "partial", "absent"]
const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Never"
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`

export default function ClassroomAttendancePage() {
  const period = useAcademicPeriod("teacher-classroom-attendance")
  const classrooms = useVirtualClassrooms(period.sessionId, period.termId)
  const [selectedId, setSelectedId] = useState("")
  const [editing, setEditing] = useState<ClassroomAttendanceStudent | null>(null)
  const [status, setStatus] = useState<ClassroomAttendanceStatus>("present")
  const [reason, setReason] = useState("")
  const queryClient = useQueryClient()
  const rooms = useMemo(
    () => (classrooms.data ?? []).filter((room) => room.status !== "cancelled"),
    [classrooms.data]
  )
  const effectiveId = rooms.some((room) => room.id === selectedId)
    ? selectedId
    : (rooms[0]?.id ?? "")
  const review = useQuery({
    queryKey: ["classroom-attendance", effectiveId],
    queryFn: () => VirtualClassroomAPI.getAttendance(effectiveId),
    enabled: Boolean(effectiveId),
    refetchInterval: 20_000,
  })
  const correct = useMutation({
    mutationFn: () =>
      VirtualClassroomAPI.correctAttendance(effectiveId, editing!.userId, {
        status,
        reason,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["classroom-attendance", effectiveId],
      })
      toast.success("Lesson attendance updated")
      setEditing(null)
      setReason("")
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Update failed"),
  })
  const openCorrection = (student: ClassroomAttendanceStudent) => {
    setEditing(student)
    setStatus(student.status)
    setReason("")
  }
  const exportCsv = () => {
    if (!review.data) return
    const rows = [
      [
        "Student",
        "Registration number",
        "Status",
        "Derived status",
        "First join",
        "Last activity",
        "Connected duration",
        "Reconnects",
        "Correction reason",
      ],
      ...review.data.students.map((student) => [
        student.name,
        student.registrationNumber,
        student.status,
        student.derivedStatus,
        student.firstJoin ?? "",
        student.lastActivity ?? "",
        formatDuration(student.connectedSeconds),
        student.reconnectCount,
        student.adjustment?.reason ?? "",
      ]),
    ]
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${review.data.classroom.title.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}-attendance.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Lesson Attendance</h1>
        <p className="text-gray-600">
          Review attendance derived from live-class activity.
        </p>
      </div>
      <AcademicPeriodSelector scope="teacher-classroom-attendance" />
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-lg">
            <Label className="mb-2 block">Classroom session</Label>
            <Select value={effectiveId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a lesson" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.title} · {new Date(room.startsAt).toLocaleDateString()} ·{" "}
                    {room.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled={!review.data} onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      {period.isLoading || classrooms.isLoading || review.isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : classrooms.isError || review.isError ? (
        <Card>
          <CardContent className="p-8 text-center text-red-600">
            Attendance could not be loaded. Please try again.
          </CardContent>
        </Card>
      ) : !effectiveId ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-500">
            <Radio className="mx-auto mb-3 h-8 w-8" />
            No classroom sessions exist for this period.
          </CardContent>
        </Card>
      ) : review.data ? (
        <>
          <CompactMetricStrip className="grid-cols-2 sm:grid-cols-5">
            {(["total", "present", "late", "partial", "absent"] as const).map((key) => (
              <CompactMetric key={key} label={key} value={review.data.summary[key]} />
            ))}
          </CompactMetricStrip>
          <div>
            {review.data.students.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-gray-500">
                  No students are enrolled in this class for the selected session.
                </CardContent>
              </Card>
            ) : (
              <CompactRecordList>
                <CompactRecordHeader className="grid-cols-[minmax(160px,1.3fr)_1fr_1fr_1fr_auto] gap-4">
                  <span>Student</span>
                  <span>First join</span>
                  <span>Participation</span>
                  <span>Status</span>
                  <span className="sr-only">Action</span>
                </CompactRecordHeader>
                {review.data.students.map((student) => (
                  <CompactRecordRow
                    key={student.userId}
                    className="md:grid-cols-[minmax(160px,1.3fr)_1fr_1fr_1fr_auto] md:items-center md:gap-4"
                  >
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-gray-500">
                        {student.registrationNumber}
                      </div>
                    </div>
                    <div className="flex justify-between gap-3 text-sm md:block">
                      <span className="text-gray-500 md:hidden">First join</span>
                      <span>{formatTime(student.firstJoin)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm md:block">
                      <span className="text-gray-500 md:hidden">Participation</span>
                      <span>
                        {formatDuration(student.connectedSeconds)} ·{" "}
                        {student.reconnectCount} reconnects
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-sm text-gray-500 md:hidden">Status</span>
                      <div>
                        <Badge
                          variant={
                            student.status === "absent" ? "destructive" : "secondary"
                          }
                          className="capitalize"
                        >
                          {student.status}
                        </Badge>
                        {student.adjustment && (
                          <div className="mt-0.5 text-[11px] text-gray-500">
                            Corrected by {student.adjustment.correctedByName}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full md:w-auto"
                      onClick={() => openCorrection(student)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Correct
                    </Button>
                  </CompactRecordRow>
                ))}
              </CompactRecordList>
            )}
          </div>
        </>
      ) : null}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correct attendance for {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ClassroomAttendanceStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason" className="mb-2 block">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this status is being corrected"
                maxLength={500}
              />
            </div>
            <Button
              className="w-full"
              disabled={!reason.trim() || correct.isPending}
              onClick={() => correct.mutate()}
            >
              {correct.isPending ? "Saving…" : "Save correction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
