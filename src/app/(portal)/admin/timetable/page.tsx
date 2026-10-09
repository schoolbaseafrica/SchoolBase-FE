"use client"

import { useMemo, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown, Plus } from "lucide-react"
import { useGetClassesInfo } from "../class-management/_hooks/use-classes"
import TimetableGrid from "./_components/timetable-grid"
import CreateScheduleModal from "./_components/create-schedule-modal"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function TimetablePage() {
  const period = useAcademicPeriod("admin-timetable")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const {
    data: classesData,
    isLoading: isLoadingClasses,
    isError: classesError,
    refetch: refetchClasses,
  } = useGetClassesInfo({ session_id: period.sessionId })

  // Group classes by name
  const classGroups = useMemo(() => classesData?.items ?? [], [classesData?.items])
  const classIds = useMemo(
    () => classGroups.flatMap((group) => group.classes.map((item) => item.id)),
    [classGroups]
  )

  const effectiveClassId =
    selectedClassId && classIds.includes(selectedClassId) ? selectedClassId : null
  const selectedClass = classGroups
    .flatMap((group) => group.classes.map((item) => ({ ...item, groupName: group.name })))
    .find((item) => item.id === effectiveClassId)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="portal-reveal max-w-3xl">
        <p className="portal-section-label mb-2">Academic planning</p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Timetable
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Review and manage class schedules for the selected academic session.
        </p>
      </div>
      <AcademicPeriodSelector scope="admin-timetable" sessionOnly />

      <section className="portal-reveal overflow-hidden rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-foreground text-sm font-semibold">Class schedule</p>
            <p className="text-muted-foreground text-sm">
              Choose a class to view or update its timetable.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-2 w-full justify-between gap-4 sm:w-auto sm:min-w-64"
                  disabled={isLoadingClasses || classesError || !classIds.length}
                >
                  <span className="truncate">
                    {isLoadingClasses
                      ? "Loading classes..."
                      : classesError
                        ? "Classes unavailable"
                        : selectedClass
                          ? `${selectedClass.groupName}${selectedClass.arm ? ` ${selectedClass.arm}` : ""}`
                          : classIds.length
                            ? "Select class"
                            : "No classes in this session"}
                  </span>
                  <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-60">
                {classGroups.map((group) => {
                  const hasArms = group.classes.some((cls) => cls.arm)

                  if (hasArms) {
                    return (
                      <DropdownMenuSub key={group.name}>
                        <DropdownMenuSubTrigger>{group.name}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {group.classes.map((cls) => (
                            <DropdownMenuItem
                              key={cls.id}
                              onClick={() => setSelectedClassId(cls.id)}
                            >
                              {group.name} {cls.arm}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )
                  }

                  return group.classes.map((cls) => (
                    <DropdownMenuItem
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      {group.name}
                    </DropdownMenuItem>
                  ))
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!effectiveClassId}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="size-4" /> Add schedule
          </Button>
        </div>

        {effectiveClassId ? (
          <TimetableGrid classId={effectiveClassId} />
        ) : (
          <div className="bg-muted/40 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--portal-line)] p-8 text-center">
            <span className="bg-accent/10 text-accent mb-4 flex size-12 items-center justify-center rounded-2xl">
              <CalendarDays className="size-6" />
            </span>
            <p className="text-foreground font-semibold">
              {isLoadingClasses
                ? "Loading classes"
                : classesError
                  ? "Classes could not be loaded"
                  : "Choose a class"}
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {classesError
                ? "Try again to load the classes for this session."
                : classIds.length
                  ? "Select a class above to see its weekly schedule."
                  : "There are no classes available in this academic session."}
            </p>
            {classesError && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => void refetchClasses()}
              >
                Try again
              </Button>
            )}
          </div>
        )}
      </section>

      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedClassId={effectiveClassId}
      />
    </div>
  )
}
