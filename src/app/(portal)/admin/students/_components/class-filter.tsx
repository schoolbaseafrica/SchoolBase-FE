"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, X, GraduationCap } from "lucide-react"
import { useGetClassesInfo } from "@/app/(portal)/admin/class-management/_hooks/use-classes"

interface ClassFilterProps {
  value?: string
  onValueChange: (value: string | undefined) => void
}

export function ClassFilter({ value, onValueChange }: ClassFilterProps) {
  const [open, setOpen] = useState(false)
  
  const { data: classesInfo, isLoading } = useGetClassesInfo({
    includeArchived: false,
    limit: 1000,
    page: 1,
  })

  // Flatten the grouped classes structure
  const allClasses = useMemo(() => {
    if (!classesInfo?.items) return []
    
    return classesInfo.items.flatMap((group) =>
      group.classes.map((cls) => ({
        id: cls.id,
        name: `${group.name}${cls.arm ? ` ${cls.arm}` : ""}`.trim(),
        groupName: group.name,
      }))
    )
  }, [classesInfo])

  const selectedClassName = useMemo(() => {
    if (!value) return null
    return allClasses.find((cls) => cls.id === value)?.name || null
  }, [value, allClasses])

  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-4 w-4 text-muted-foreground" />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 justify-between min-w-[200px]"
            disabled={isLoading}
          >
            <span className="truncate">
              {selectedClassName || "All Classes"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
          <DropdownMenuRadioGroup
            value={value || "all"}
            onValueChange={(newValue) => {
              if (newValue === "all") {
                onValueChange(undefined)
              } else {
                onValueChange(newValue)
              }
              setOpen(false)
            }}
          >
            <DropdownMenuRadioItem value="all">
              <span className="flex items-center gap-2">
                <span>All Classes</span>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Loading classes...
              </div>
            ) : allClasses.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No classes found
              </div>
            ) : (
              allClasses.map((cls) => (
                <DropdownMenuRadioItem key={cls.id} value={cls.id}>
                  {cls.name}
                </DropdownMenuRadioItem>
              ))
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2"
          onClick={() => onValueChange(undefined)}
          title="Clear filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
