"use client"

import { useStudentProfile } from "../_hooks/use-student-profile"
import { useGetClassTimetable } from "../_hooks/use-student-timetable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock, MapPin, User, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/results/empty-state"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

export default function StudentTimetablePage() {
  const router = useRouter()

  // Get student profile using shared hook
  const {
    data: studentProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useStudentProfile()

  const classId = studentProfile?.class_details?.id

  // Get full weekly timetable for the class
  const {
    data: timetable,
    isLoading: isLoadingTimetable,
    error: timetableError,
  } = useGetClassTimetable(classId)

  const isLoading = isLoadingProfile || isLoadingTimetable

  // Debug logging
  console.log("[StudentTimetablePage] State:", {
    isLoadingProfile,
    isLoadingTimetable,
    isLoading,
    profileError,
    timetableError,
    studentProfile: studentProfile
      ? {
          id: studentProfile.id,
          class_details: studentProfile.class_details,
          full_profile: studentProfile, // Log full profile to see what's actually returned
        }
      : null,
    classId,
    hasClassId: !!classId,
    timetable: timetable
      ? {
          schedulesCount: timetable.schedules?.length || 0,
          schedules: timetable.schedules,
        }
      : null,
  })

  if (!classId && studentProfile && !isLoadingProfile) {
    console.warn(
      "[StudentTimetablePage] WARNING: No classId available. studentProfile.class_details:",
      studentProfile.class_details
    )
  }

  if (!studentProfile && !isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Timetable</h1>
          <p className="text-gray-600">View your class schedule</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Student information not available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Timetable</h1>
          <p className="text-gray-600">
            {studentProfile?.class_details?.name
              ? `Class: ${studentProfile.class_details.name}`
              : "View your class schedule"}
          </p>
        </div>
        {classId && (
          <Button
            variant="outline"
            onClick={() => router.push(`/student/classroom/${classId}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Open Classroom
          </Button>
        )}
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
          description="You are not assigned to a class yet. Please contact the administrator."
          icon={CalendarDays}
        />
      ) : !timetable || timetable.schedules.length === 0 ? (
        <EmptyState
          title="No Timetable Available"
          description="No timetable has been created for your class yet."
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
