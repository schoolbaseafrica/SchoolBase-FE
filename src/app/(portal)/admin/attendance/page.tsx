"use client"

import React, { useState, useMemo } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import AttendanceTable from "./_components/attendance-table"
import AttendanceGrid from "./_components/attendance-grid"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useDailyAttendance } from "./_hooks/use-attendance-admin"
import { useGetClassesInfo } from "../class-management/_hooks/use-classes"

const Attendance = () => {
  const today = new Date().toISOString().split("T")[0]

  const [search, setSearch] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")

  // Fetch all classes
  const { data: classesData, isLoading: classesLoading } = useGetClassesInfo()

  // Flatten class structure
  const classes = useMemo(() => {
    if (!classesData?.items) return []
    return classesData.items.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: cls.arm ? `${group.name} ${cls.arm}` : group.name,
      }))
    )
  }, [classesData])

  // Compute the initial class without useEffect
  const initialClassId = useMemo(() => {
    if (!selectedClassId && classes.length > 0) {
      return classes[0].id
    }
    return selectedClassId
  }, [classes, selectedClassId])

  // Ensure state always aligns with computed initial class
  if (selectedClassId !== initialClassId) {
    setSelectedClassId(initialClassId)
  }

  // Fetch attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useDailyAttendance(
    initialClassId,
    today
  )

  // Filter search
  const filteredStudents = useMemo(() => {
    if (!attendanceData?.students) return []
    return attendanceData.students.filter((s) =>
      `${s.first_name} ${s.middle_name || ""} ${s.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [attendanceData, search])

  const isLoading = classesLoading || attendanceLoading
  const hasNoClasses = !classesLoading && classes.length === 0
  const hasNoStudents = !attendanceLoading && filteredStudents.length === 0

  return (
    <div className="px-5 pt-10">
      <DashboardTitle
        heading="Attendance"
        description="View and manage the attendance of all students here"
      />

      {/* Search + Class dropdown */}
      <div className="mt-5 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="text-text-secondary absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <Input
            className="w-full pl-7"
            placeholder="Search student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="w-full md:w-60">
          <Select
            value={initialClassId}
            onValueChange={setSelectedClassId}
            disabled={classesLoading || hasNoClasses}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-500">Loading attendance data...</p>
        </div>
      )}

      {/* No Classes */}
      {hasNoClasses && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <p className="text-lg font-semibold text-gray-700">No Classes Available</p>
          <p className="mt-2 text-gray-500">Please create a class to view attendance</p>
        </div>
      )}

      {/* No Students */}
      {!isLoading && !hasNoClasses && hasNoStudents && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <p className="text-lg font-semibold text-gray-700">No Students Found</p>
          <p className="mt-2 text-gray-500">
            {search
              ? "No students match your search criteria"
              : "No attendance records for this class today"}
          </p>
        </div>
      )}

      {/* Table + Grid */}
      {!isLoading && !hasNoClasses && !hasNoStudents && (
        <>
          <AttendanceTable data={attendanceData} students={filteredStudents} />
          <AttendanceGrid data={attendanceData} students={filteredStudents} />
        </>
      )}
    </div>
  )
}

export default Attendance
