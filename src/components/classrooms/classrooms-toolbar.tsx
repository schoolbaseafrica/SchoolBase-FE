"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ChevronDown, ChevronUp, ListFilter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClassroomsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterType: string
  onFilterTypeChange: (type: string) => void
  onAddClassroom: () => void
}

const filterOptions = [
  { value: "all", label: "All Classrooms" },
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
  { value: "capacity", label: "Capacity" },
  { value: "location", label: "Location" },
]

export function ClassroomsToolbar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  onAddClassroom,
}: ClassroomsToolbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-1 mb-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            View, add, and assign classes to streamline academic operations
          </p>
        </div>
        <Button
          onClick={onAddClassroom}
          className="w-full rounded-xl font-medium sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Room
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Search classrooms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="placeholder:text-muted-foreground/70 h-11 rounded-lg border bg-white pl-11 text-base"
          />
        </div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`h-12 justify-between rounded-lg border font-normal transition-colors ${open ? "bg-red-100" : ""}`}
            >
              <ListFilter className="text-muted-foreground hidden h-4 w-4 lg:block" />
              {open ? (
                <ChevronUp className="text-muted-foreground h-4 w-4 lg:hidden" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4 lg:hidden" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup value={filterType} onValueChange={onFilterTypeChange}>
              {filterOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
