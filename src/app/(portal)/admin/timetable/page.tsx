"use client"

import { useState } from "react"
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
import { useQuery } from "@tanstack/react-query"
import { ClassesAPI } from "@/lib/classes"
import TimetableGrid from "./_components/timetable-grid"
import CreateScheduleModal from "./_components/create-schedule-modal"

export default function TimetablePage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => ClassesAPI.getAll(),
  })

  // Group classes by name
  const classGroups = classesData?.data?.items || []

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#2d2d2d]">Timetable Management</h1>
          <p className="text-sm text-[#666666]">Here you can schedule and edit classes</p>
        </div>
      </div>

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
                  ) : selectedClassId ? (
                    classGroups
                      .flatMap((g) => g.classes)
                      .find((c) => c.id === selectedClassId)?.arm ? (
                      `${classGroups.find((g) => g.classes.some((c) => c.id === selectedClassId))?.name} ${classGroups.flatMap((g) => g.classes).find((c) => c.id === selectedClassId)?.arm}`
                    ) : (
                      classGroups.find((g) =>
                        g.classes.some((c) => c.id === selectedClassId)
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

        {selectedClassId ? (
          <TimetableGrid classId={selectedClassId} />
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
            Please select a class to view its timetable
          </div>
        )}
      </div>

      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedClassId={selectedClassId}
      />
    </div>
  )
}
