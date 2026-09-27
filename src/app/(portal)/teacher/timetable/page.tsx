"use client"

import { useMemo, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, AlertCircle } from "lucide-react"
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
    : "Select Class"

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#2d2d2d]">Timetable</h1>
        <p className="text-sm text-[#666666]">View schedules for your assigned classes</p>
      </div>

      <AcademicPeriodSelector scope="teacher-timetable" sessionOnly />

      {/* Loading State */}
      {isLoadingClasses && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading classes...</span>
        </div>
      )}

      {/* Error State */}
      {!isLoadingClasses && classesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your assigned classes. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoadingClasses && !classesError && (
        <div className="flex max-w-7xl flex-col gap-4">
          {/* Class Selector */}
          {classesArray.length > 0 ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-accent border-accent flex w-full justify-between px-8 text-sm font-bold"
                    >
                      {classDisplayName}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]">
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
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are not assigned to any classes yet. Contact your administrator.
              </AlertDescription>
            </Alert>
          )}

          {/* Timetable Grid */}
          {effectiveClassId ? (
            <TimetableGrid
              classId={effectiveClassId}
              readonly
              onOpenClassroom={openClassroom}
            />
          ) : classesArray.length > 0 ? (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
              Please select a class to view its timetable
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
