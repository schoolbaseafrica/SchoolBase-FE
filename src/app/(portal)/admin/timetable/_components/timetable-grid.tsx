"use client"

import { Schedule } from "@/lib/timetable"
import { BookOpen, Pencil } from "lucide-react"
import { useState } from "react"
import { useClassTimetable } from "../_hooks/use-timetable"
import EditScheduleModal from "./edit-schedule-modal"
import MobileTimetableView from "./mobile-timetable-view"
import TimetableLoading from "./timetable-loading"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
const TIME_SLOTS = [
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
]

const formatTime = (time: string) => {
  const [hours] = time.split(":")
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const formattedHours = h % 12 || 12
  return `${formattedHours}:00 ${ampm}`
}

interface TimetableGridProps {
  classId: string
  readonly?: boolean
  onOpenClassroom?: (schedule: Schedule) => void
}

export default function TimetableGrid({
  classId,
  readonly = false,
  onOpenClassroom,
}: TimetableGridProps) {
  const timetable = useClassTimetable(classId)
  const schedules = timetable.data?.schedules ?? []

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (timetable.isPending) {
    return <TimetableLoading />
  }

  if (timetable.isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-foreground rounded-2xl border p-6 text-sm">
        <p className="font-semibold">Timetable could not be loaded.</p>
        <button
          type="button"
          onClick={() => void timetable.refetch()}
          className="text-primary mt-3 font-semibold hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  const getScheduleForSlot = (day: string, time: string) => {
    return schedules.find(
      (s) => s.day === day && time >= s.start_time && time < s.end_time
    )
  }

  const handleEdit = (schedule: Schedule) => {
    if (readonly) return
    setEditingSchedule(schedule)
    setIsEditModalOpen(true)
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden w-full min-[834px]:block">
        <div className="overflow-x-auto rounded-2xl border border-[var(--portal-line)] bg-white">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr>
                <th className="bg-muted/50 text-muted-foreground border-r border-b border-[var(--portal-line)] px-2.5 py-4 text-left text-xs font-semibold">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="bg-muted/50 text-muted-foreground border-r border-b border-[var(--portal-line)] px-2.5 py-4 text-center text-xs font-semibold last:border-r-0"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr
                  key={time}
                  className="border-b border-[var(--portal-line)] last:border-0"
                >
                  <td className="text-muted-foreground border-r border-[var(--portal-line)] px-2.5 py-4 text-sm font-medium whitespace-nowrap">
                    {formatTime(time)}
                  </td>
                  {DAYS.map((day) => {
                    const schedule = getScheduleForSlot(day, time)
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="border-r border-[var(--portal-line)] px-2 py-2 last:border-r-0"
                      >
                        {schedule ? (
                          <div
                            role={readonly ? undefined : "button"}
                            tabIndex={readonly ? undefined : 0}
                            onClick={() => handleEdit(schedule)}
                            onKeyDown={(event) => {
                              if (event.target !== event.currentTarget) return
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                handleEdit(schedule)
                              }
                            }}
                            className={`group border-l-accent bg-accent/5 relative flex flex-col gap-1 rounded-xl border border-l-4 border-[var(--portal-line)] p-3 text-xs transition-colors ${
                              !readonly ? "hover:bg-accent/10 cursor-pointer" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-foreground font-semibold">
                                {schedule.period_type === "BREAK"
                                  ? "BREAK"
                                  : schedule.subject?.name}
                              </span>
                              {!readonly && (
                                <Pencil
                                  aria-hidden="true"
                                  className="text-muted-foreground size-3"
                                />
                              )}
                            </div>
                            {schedule.period_type !== "BREAK" && (
                              <span className="text-foreground text-wrap">
                                {schedule.teacher?.title} {schedule.teacher?.first_name}{" "}
                                {schedule.teacher?.last_name}
                              </span>
                            )}
                            {schedule.room && (
                              <span className="text-muted-foreground text-[10px]">
                                Room: {schedule.room.name}
                              </span>
                            )}
                            {onOpenClassroom && schedule.period_type !== "BREAK" && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onOpenClassroom(schedule)
                                }}
                                className="text-foreground hover:border-accent/40 hover:text-accent mt-1 flex items-center gap-1 self-start rounded-lg border border-[var(--portal-line)] bg-white px-2 py-1 text-[10px] font-medium"
                              >
                                <BookOpen className="h-3 w-3" />
                                Classroom
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] w-full" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block w-full min-[834px]:hidden">
        <MobileTimetableView
          schedules={schedules}
          onEdit={handleEdit}
          readonly={readonly}
          onOpenClassroom={onOpenClassroom}
        />
      </div>

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSchedule(null)
        }}
        schedule={editingSchedule}
      />
    </>
  )
}
