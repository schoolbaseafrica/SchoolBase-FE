"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGetTeachers } from "../../teachers/_hooks/use-teachers"
import type { SnakeUser as User } from "@/types/user"

interface TeacherComboboxProps {
  value?: string
  onValueChange?: (teacherId: string | null, teacherName: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TeacherCombobox({
  value,
  onValueChange,
  placeholder = "Select teacher...",
  disabled = false,
  className,
}: TeacherComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { data: teachers = [], isLoading } = useGetTeachers()

  // Get teacher name from ID
  const selectedTeacher = React.useMemo(() => {
    if (!value || !teachers.length) return null
    return teachers.find((t) => t.id === value || t.teacher_id === value) || null
  }, [value, teachers])

  const teacherDisplayName = selectedTeacher
    ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`.trim()
    : ""

  // Filter teachers based on search
  const filteredTeachers = React.useMemo(() => {
    if (!teachers.length) return []
    return teachers.filter((teacher) => teacher.is_active !== false)
  }, [teachers])

  const handleSelect = (teacherId: string) => {
    const teacher = filteredTeachers.find((t) => t.id === teacherId || t.teacher_id === teacherId)
    if (teacher) {
      const teacherName = `${teacher.first_name} ${teacher.last_name}`.trim()
      onValueChange?.(teacherId, teacherName)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between text-left font-normal",
            !teacherDisplayName && "text-muted-foreground",
            className
          )}
        >
          {isLoading
            ? "Loading teachers..."
            : teacherDisplayName || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0" 
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder="Search teachers..." className="h-9" />
          <CommandList>
            <CommandEmpty>No teacher found.</CommandEmpty>
            <CommandGroup>
              {filteredTeachers.map((teacher) => {
                const teacherId = teacher.id || teacher.teacher_id || ""
                const teacherName = `${teacher.first_name} ${teacher.last_name}`.trim()
                const isSelected = value === teacherId || value === teacher.teacher_id
                return (
                  <CommandItem
                    key={teacherId}
                    value={`${teacherName} ${teacher.email || ""}`.toLowerCase()}
                    onSelect={() => handleSelect(teacherId)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{teacherName}</span>
                      {teacher.email && (
                        <span className="text-xs text-muted-foreground">{teacher.email}</span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}