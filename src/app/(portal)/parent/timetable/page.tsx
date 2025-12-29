"use client"

import { useParentStudents } from "../_components/student-provider"
import { StudentSelector } from "../_components/student-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, MapPin, User, BookOpen } from "lucide-react"
import { useGetStudentProfile, useGetClassTimetable } from "../_hooks/use-parent-students"
import { EmptyState } from "@/components/results/empty-state"

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

export default function ParentTimetablePage() {
  const { selectedStudent } = useParentStudents()
  const { data: studentProfile, isLoading: isLoadingProfile } = useGetStudentProfile(
    selectedStudent?.id
  )
  const classId = studentProfile?.class_details?.id
  const { data: timetable, isLoading: isLoadingTimetable } = useGetClassTimetable(classId)

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Timetable</h1>
          <p className="text-gray-600">View your child&apos;s class schedule</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Please select a student to view timetable</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLoading = isLoadingProfile || isLoadingTimetable

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Timetable</h1>
          <p className="text-gray-600">
            {studentProfile?.class_details?.name
              ? `Class: ${studentProfile.class_details.name}`
              : "View your child's class schedule"}
          </p>
        </div>
        <StudentSelector />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : !classId ? (
        <EmptyState
          title="No Class Assigned"
          description="This student is not assigned to a class yet. Please contact the administrator."
          icon={CalendarDays}
        />
      ) : !timetable || timetable.schedules.length === 0 ? (
        <EmptyState
          title="No Timetable Available"
          description="No timetable has been created for this class yet."
          icon={CalendarDays}
        />
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const daySchedules = timetable.schedules.filter((s) => s.day === day)
            if (daySchedules.length === 0) return null

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {schedule.subject?.name || schedule.period_type}
                            </span>
                          </div>
                          {schedule.teacher && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              <span>
                                {schedule.teacher.title} {schedule.teacher.first_name}{" "}
                                {schedule.teacher.last_name}
                              </span>
                            </div>
                          )}
                          {schedule.room && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{schedule.room.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
