"use client"

import { FC, SVGProps } from "react"
import { LucideIcon, BookOpen, FlaskConicalOff } from "lucide-react"
import { BiMath } from "react-icons/bi"
import { Skeleton } from "@/components/ui/skeleton"

interface ScheduleItem {
  subject: string
  time: string
  room: string
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>
  Teacher: string
}

interface TodaysTimetableProps {
  schedule: ScheduleItem[]
  isLoading?: boolean
}

// Icon mapping for subjects
const getSubjectIcon = (
  subjectName: string
): LucideIcon | FC<SVGProps<SVGSVGElement>> => {
  const name = subjectName.toLowerCase()
  if (name.includes("math")) return BiMath
  if (name.includes("chem") || name.includes("science")) return FlaskConicalOff
  return BookOpen
}

// Format time from HH:mm:ss to HH:mm AM/PM
const formatTime = (timeStr: string): string => {
  try {
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return timeStr
  }
}

export function TodaysTimetable({ schedule, isLoading }: TodaysTimetableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Today&apos;s Timetable</h2>
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <p className="py-4 text-center text-gray-500">No classes scheduled for today</p>
        ) : (
          schedule.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="rounded-xl bg-[#E6E6E6] p-2 text-3xl">
                <item.icon className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.subject}</div>
                <div className="text-sm text-gray-600">{item.time}</div>
                <div className="text-sm text-gray-600">Teacher: {item.Teacher}</div>
              </div>
              <div className="text-sm text-gray-500">{item.room}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Export utility functions for use in parent component
export { getSubjectIcon, formatTime }
