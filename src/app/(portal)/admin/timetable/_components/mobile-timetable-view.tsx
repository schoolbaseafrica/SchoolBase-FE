"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { Schedule } from "@/lib/timetable"
import { cn } from "@/lib/utils"

interface MobileTimetableViewProps {
  schedules: Schedule[]
  onEdit: (schedule: Schedule) => void
  readonly?: boolean
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
      <div className="scrollbar-hide flex w-full overflow-x-auto rounded-lg border border-[#E4E7EC] bg-white p-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              selectedDay === day
                ? "bg-[#DA3743] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
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
              onClick={() => schedule && !readonly && onEdit(schedule)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-lg border p-4 shadow-sm transition-all",
                schedule
                  ? !readonly
                    ? "cursor-pointer border-[#E4E7EC] bg-white hover:border-[#DA3743] hover:shadow-md"
                    : "border-[#E4E7EC] bg-white"
                  : "border-dashed border-gray-200 bg-gray-50/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">{timeRange}</span>
                  <h3
                    className={cn(
                      "font-semibold",
                      schedule ? "text-[#2d2d2d]" : "text-gray-400 italic"
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
                  <button className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors group-hover:bg-[#DA3743] group-hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>

              {schedule && schedule.period_type !== "BREAK" && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Teacher</span>
                    <span className="text-sm font-medium text-[#2d2d2d]">
                      {schedule.teacher?.title} {schedule.teacher?.first_name}{" "}
                      {schedule.teacher?.last_name}
                    </span>
                  </div>
                  {schedule.room && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Room</span>
                      <span className="text-sm font-medium text-[#2d2d2d]">
                        {schedule.room.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
