"use client"

import { useMemo, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, AlertCircle, CalendarDays } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetTeacherAssignedClasses } from "../attendance/_hooks/use-teacher-attendance"
import TimetableGrid from "../../admin/timetable/_components/timetable-grid"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { Schedule } from "@/lib/timetable"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"
import { useVirtualClassrooms } from "@/hooks/use-virtual-classroom"
import { toast } from "sonner"

export default function TeacherTimetablePage() {
  const router = useRouter()
  const period = useAcademicPeriod("teacher-timetable")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [openingScheduleId, setOpeningScheduleId] = useState<string | null>(null)
  const classrooms = useVirtualClassrooms(period.sessionId, period.termId)

  const openClassroom = async (schedule: Schedule) => {
    if (!period.sessionId || openingScheduleId) return
    setOpeningScheduleId(schedule.id)
    try {
      let room = classrooms.data?.find(
        (candidate) =>
          candidate.scheduleId === schedule.id &&
          (candidate.status === "scheduled" || candidate.status === "live")
      )
      if (!room) {
        const startsAt = new Date()
        const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000)
        room = await VirtualClassroomAPI.create({
          scheduleId: schedule.id,
          sessionId: period.sessionId,
          termId: period.termId,
          title: schedule.subject?.name
            ? `${schedule.subject.name} live class`
            : "Live classroom",
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        })
      }
      if (room.status === "scheduled") {
        room = await VirtualClassroomAPI.setStatus(room.id, "live")
      }
      router.push(`/teacher/classroom/${room.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open classroom")
    } finally {
      setOpeningScheduleId(null)
    }
  }

  const {
    data: assignedClasses,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useGetTeacherAssignedClasses(period.sessionId)

  // Ensure assignedClasses is an array
  const classesArray = useMemo(
    () => (Array.isArray(assignedClasses) ? assignedClasses : []),
    [assignedClasses]
  )
  const effectiveClassId = classesArray.some((item) => item.id === selectedClassId)
    ? selectedClassId
    : null

  const selectedClass = classesArray.find((cls) => cls.id === effectiveClassId)
  const classDisplayName = selectedClass
    ? `${selectedClass.name}${selectedClass.arm ? ` ${selectedClass.arm}` : ""}`
    : "Select class"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="portal-reveal max-w-3xl">
        <p className="portal-section-label mb-2">Academic planning</p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Timetable
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Review schedules for your assigned classes in the selected academic session.
        </p>
      </div>

      <AcademicPeriodSelector scope="teacher-timetable" sessionOnly />

      <section className="portal-reveal overflow-hidden rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 space-y-2">
          <p className="text-foreground text-sm font-semibold">Class schedule</p>
          <p className="text-muted-foreground text-sm">
            Choose a class to view its timetable and open a virtual classroom.
          </p>
          <div className="pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between gap-4 sm:w-auto sm:min-w-64"
                  disabled={isLoadingClasses || !!classesError || !classesArray.length}
                >
                  <span className="truncate">
                    {isLoadingClasses
                      ? "Loading classes..."
                      : classesError
                        ? "Classes unavailable"
                        : classesArray.length
                          ? classDisplayName
                          : "No assigned classes"}
                  </span>
                  <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-60">
                {classesArray.map((cls) => {
                  const displayName = `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}`
                  return (
                    <DropdownMenuItem
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      {displayName}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {classesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your assigned classes. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingClasses && !classesError && effectiveClassId ? (
          <TimetableGrid
            classId={effectiveClassId}
            readonly
            onOpenClassroom={openClassroom}
          />
        ) : (
          <div className="bg-muted/40 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--portal-line)] p-8 text-center">
            <span className="bg-accent/10 text-accent mb-4 flex size-12 items-center justify-center rounded-2xl">
              {isLoadingClasses ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <CalendarDays className="size-6" />
              )}
            </span>
            <p className="text-foreground font-semibold">
              {isLoadingClasses
                ? "Loading classes"
                : classesError
                  ? "Classes could not be loaded"
                  : classesArray.length
                    ? "Choose a class"
                    : "No assigned classes"}
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {classesArray.length
                ? "Select a class above to see its weekly schedule."
                : "Ask your administrator to assign you to a class in this session."}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
