"use client"

import { useState } from "react"
import { BookOpen, Pencil } from "lucide-react"
import { Schedule } from "@/lib/timetable"
import { cn } from "@/lib/utils"

interface MobileTimetableViewProps {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  readonly?: boolean
  onOpenClassroom?: (schedule: Schedule) => void
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":")
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const formattedHours = h % 12 || 12
  return `${formattedHours}:${minutes} ${ampm}`
}

export default function MobileTimetableView({
  schedules,
  onEdit,
  readonly = false,
  onOpenClassroom,
}: MobileTimetableViewProps) {
  const [selectedDay, setSelectedDay] = useState("MONDAY")

  const TIME_SLOTS = [
    "08:00:00",
    "09:00:00",
    "10:00:00",
    "11:00:00",
    "12:00:00",
    "13:00:00",
    "14:00:00",
  ]

  const getScheduleForSlot = (time: string) => {
    return schedules.find(
      (s) => s.day === selectedDay && time >= s.start_time && time < s.end_time
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day Selector */}
      <div className="scrollbar-hide bg-muted/30 flex w-full overflow-x-auto rounded-xl border border-[var(--portal-line)] p-1">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={selectedDay === day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              selectedDay === day
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white"
            )}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="flex flex-col gap-3">
        {TIME_SLOTS.map((time) => {
          const schedule = getScheduleForSlot(time)
          const [hours] = time.split(":")
          const nextHour = parseInt(hours, 10) + 1
          const timeRange = `${formatTime(time)} - ${formatTime(`${nextHour}:00:00`)}`

          return (
            <div
              key={time}
              role={schedule && !readonly ? "button" : undefined}
              tabIndex={schedule && !readonly ? 0 : undefined}
              onClick={() => schedule && !readonly && onEdit(schedule)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget || !schedule || readonly) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onEdit(schedule)
                }
              }}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all",
                schedule
                  ? !readonly
                    ? "hover:border-accent/50 cursor-pointer border-[var(--portal-line)] bg-white hover:shadow-md"
                    : "border-[var(--portal-line)] bg-white"
                  : "bg-muted/30 border-dashed border-[var(--portal-line)]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-medium">
                    {timeRange}
                  </span>
                  <h3
                    className={cn(
                      "font-semibold",
                      schedule ? "text-foreground" : "text-muted-foreground italic"
                    )}
                  >
                    {schedule
                      ? schedule.period_type === "BREAK"
                        ? "BREAK"
                        : schedule.subject?.name
                      : ""}
                  </h3>
                </div>
                {schedule && !readonly && (
                  <Pencil aria-hidden="true" className="text-accent size-4" />
                )}
              </div>

              {schedule && schedule.period_type !== "BREAK" && (
                <div className="flex items-center justify-between border-t border-[var(--portal-line)] pt-3">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Teacher</span>
                    <span className="text-foreground text-sm font-medium">
                      {schedule.teacher?.title} {schedule.teacher?.first_name}{" "}
                      {schedule.teacher?.last_name}
                    </span>
                  </div>
                  {schedule.room && (
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground text-xs">Room</span>
                      <span className="text-foreground text-sm font-medium">
                        {schedule.room.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {schedule && schedule.period_type !== "BREAK" && onOpenClassroom && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpenClassroom(schedule)
                  }}
                  className="text-foreground hover:border-accent/40 hover:text-accent flex items-center justify-center gap-2 rounded-lg border border-[var(--portal-line)] px-3 py-2 text-sm font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  Open classroom
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
