"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useClassTimetable } from "../_hooks/use-timetable"
import TimetableLoading from "./timetable-loading"
import EditScheduleModal from "./edit-schedule-modal"
import MobileTimetableView from "./mobile-timetable-view"
import { Schedule } from "@/lib/timetable"

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
}

export default function TimetableGrid({ classId, readonly = false }: TimetableGridProps) {
  const { data, isLoading } = useClassTimetable(classId)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (isLoading) {
    return <TimetableLoading />
  }

  const schedules = data?.data?.schedules || []

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
      <div className="hidden w-full min-[834px]:block min-[834px]:max-w-[calc(100vw-18rem)]">
        <div className="overflow-x-auto rounded-[8px] border border-[#2D2D2D4D] bg-white">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr>
                <th className="border-r border-b border-[#2D2D2D4D] bg-[#F9FAFB] px-[10px] py-4 text-left text-xs font-medium text-[#535353]">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="border-r border-b border-[#2D2D2D4D] bg-[#F9FAFB] px-[10px] py-4 text-center text-xs font-medium text-[#535353] last:border-r-0"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="border-b border-[#2D2D2D4D] last:border-0">
                  <td className="border-r px-[10px] py-4 text-sm font-medium whitespace-nowrap text-[#535353]">
                    {formatTime(time)}
                  </td>
                  {DAYS.map((day) => {
                    const schedule = getScheduleForSlot(day, time)
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="border-r px-2 py-2 last:border-r-0"
                      >
                        {schedule ? (
                          <div
                            onClick={() => handleEdit(schedule)}
                            className={`group relative flex flex-col gap-1 rounded border-l-4 border-[#2d2d2d] bg-[#EEEEEE] p-3 py-2 pr-1 text-xs transition-colors ${
                              !readonly ? "cursor-pointer hover:bg-gray-200" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-[#2d2d2d]">
                                {schedule.period_type === "BREAK"
                                  ? "BREAK"
                                  : schedule.subject?.name}
                              </span>
                              {!readonly && (
                                <button className="invisible rounded-full p-1 group-hover:visible hover:bg-gray-300">
                                  <Pencil className="h-3 w-3 text-gray-500" />
                                </button>
                              )}
                            </div>
                            {schedule.period_type !== "BREAK" && (
                              <span className="text-wrap text-[#2d2d2d]">
                                {schedule.teacher?.title} {schedule.teacher?.first_name}{" "}
                                {schedule.teacher?.last_name}
                              </span>
                            )}
                            {schedule.room && (
                              <span className="text-[10px] text-gray-500">
                                Room: {schedule.room.name}
                              </span>
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
