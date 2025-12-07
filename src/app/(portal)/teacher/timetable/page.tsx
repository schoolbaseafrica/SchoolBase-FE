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
import TimetableGrid from "../../admin/timetable/_components/timetable-grid"

export default function TeacherTimetablePage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

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
          <h1 className="text-2xl font-bold text-[#2d2d2d]">Timetable</h1>
          <p className="text-sm text-[#666666]">View class schedules</p>
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
                  {selectedClassId
                    ? classGroups
                        .flatMap((g) => g.classes)
                        .find((c) => c.id === selectedClassId)?.arm
                      ? `${classGroups.find((g) => g.classes.some((c) => c.id === selectedClassId))?.name} ${classGroups.flatMap((g) => g.classes).find((c) => c.id === selectedClassId)?.arm}`
                      : classGroups.find((g) =>
                          g.classes.some((c) => c.id === selectedClassId)
                        )?.name
                    : "Select Class"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]">
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
        </div>

        {selectedClassId ? (
          <TimetableGrid classId={selectedClassId} readonly={true} />
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500">
            Please select a class to view its timetable
          </div>
        )}
      </div>
    </div>
  )
}
