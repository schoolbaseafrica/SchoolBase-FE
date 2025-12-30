"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, AlertCircle, BookOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetTeacherAssignedClasses } from "../attendance/_hooks/use-teacher-attendance"
import TimetableGrid from "../../admin/timetable/_components/timetable-grid"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TeacherTimetablePage() {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const {
    data: assignedClasses,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useGetTeacherAssignedClasses()

  // Ensure assignedClasses is an array
  const classesArray = Array.isArray(assignedClasses) ? assignedClasses : []

  // Auto-select first class if available
  useEffect(() => {
    if (classesArray.length > 0 && !selectedClassId) {
      setSelectedClassId(classesArray[0].id)
    }
  }, [classesArray, selectedClassId])

  const selectedClass = classesArray.find((cls) => cls.id === selectedClassId)
  const classDisplayName = selectedClass
    ? `${selectedClass.name}${selectedClass.arm ? ` ${selectedClass.arm}` : ""}`
    : "Select Class"

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#2d2d2d]">Timetable</h1>
          <p className="text-sm text-[#666666]">
            View schedules for your assigned classes
          </p>
        </div>
        {/* Show "Open Classroom" button when a class is selected */}
        {selectedClassId && (
          <Button
            variant="outline"
            onClick={() => router.push(`/teacher/classroom/${selectedClassId}`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Open Classroom
          </Button>
        )}
      </div>

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
          {selectedClassId ? (
            <TimetableGrid classId={selectedClassId} readonly={true} />
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
