"use client"

import { useRouter } from "next/navigation"
import { BookOpen, CalendarClock, Loader2, Radio, Video } from "lucide-react"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { EmptyState } from "@/components/results/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { useVirtualClassrooms } from "@/hooks/use-virtual-classroom"

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

export default function StudentClassesPage() {
  const router = useRouter()
  const period = useAcademicPeriod("student-live-classes")
  const classrooms = useVirtualClassrooms(period.sessionId, period.termId)
  const rooms = (classrooms.data ?? []).filter(
    (room) => room.status === "live" || room.status === "scheduled"
  )

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Live Classes</h1>
        <p className="text-gray-600">
          Join lessons opened by your teachers or review upcoming classroom sessions.
        </p>
      </div>

      <AcademicPeriodSelector scope="student-live-classes" />

      {period.isLoading || classrooms.isLoading ? (
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : classrooms.isError ? (
        <EmptyState
          icon={Video}
          title="Classes could not be loaded"
          description={
            classrooms.error instanceof Error
              ? classrooms.error.message
              : "Please try again. If the problem continues, contact your school administrator."
          }
          action={<Button onClick={() => classrooms.refetch()}>Try again</Button>}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No live or upcoming classes"
          description="A lesson will appear here when your teacher schedules or starts it."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className={room.status === "live" ? "border-red-200" : ""}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{room.title}</CardTitle>
                  <Badge variant={room.status === "live" ? "default" : "secondary"}>
                    {room.status === "live" ? "Live now" : "Scheduled"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDateTime(room.startsAt)} – {formatDateTime(room.endsAt)}
                </div>
              </CardHeader>
              <CardContent>
                {room.status === "live" ? (
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/student/classroom/${room.id}`)}
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    Join live class
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Waiting for teacher
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
