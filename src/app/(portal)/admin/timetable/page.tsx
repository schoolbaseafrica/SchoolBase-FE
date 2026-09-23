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
import { ChevronDown } from "lucide-react"
// import { useQuery } from "@tanstack/react-query"
// import { ClassesAPI } from "@/lib/classes"
import { useGetClassesInfo } from "../class-management/_hooks/use-classes"
import TimetableGrid from "./_components/timetable-grid"
import CreateScheduleModal from "./_components/create-schedule-modal"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function TimetablePage() {
  const period = useAcademicPeriod("admin-timetable")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Use the hook that syncs with store
  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesInfo({
    session_id: period.sessionId,
  })

  // Group classes by name
  const classGroups = useMemo(() => classesData?.items ?? [], [classesData?.items])
  const classIds = useMemo(
    () => classGroups.flatMap((group) => group.classes.map((item) => item.id)),
    [classGroups]
  )

  const effectiveClassId =
    selectedClassId && classIds.includes(selectedClassId) ? selectedClassId : null

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#2d2d2d]">Timetable Management</h1>
          <p className="text-sm text-[#666666]">Here you can schedule and edit classes</p>
        </div>
      </div>
      <AcademicPeriodSelector scope="admin-timetable" sessionOnly />

      <div className="flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-accent border-accent flex w-full justify-between px-8 text-sm font-bold"
                  disabled={isLoadingClasses}
                >
                  {isLoadingClasses ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      <span>Loading classes...</span>
                    </div>
                  ) : effectiveClassId ? (
                    classGroups
                      .flatMap((g) => g.classes)
                      .find((c) => c.id === effectiveClassId)?.arm ? (
                      `${classGroups.find((g) => g.classes.some((c) => c.id === effectiveClassId))?.name} ${classGroups.flatMap((g) => g.classes).find((c) => c.id === effectiveClassId)?.arm}`
                    ) : (
                      classGroups.find((g) =>
                        g.classes.some((c) => c.id === effectiveClassId)
                      )?.name
                    )
                  ) : (
                    "Select Class"
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative left-10 w-[--radix-dropdown-menu-trigger-width] min-w-60">
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
            variant={"outline"}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-12 w-full items-center gap-2 md:w-auto"
          >
            Create new schedule
          </Button>
        </div>

        {effectiveClassId ? (
          <TimetableGrid classId={effectiveClassId} />
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
            Please select a class to view its timetable
          </div>
        )}
      </div>

      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedClassId={effectiveClassId}
      />
    </div>
  )
}
