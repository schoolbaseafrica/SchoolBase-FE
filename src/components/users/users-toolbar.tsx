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
import { UserType } from "@/types/user"

interface UsersToolbarProps {
  userType: UserType
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  onAddUser: () => void
}

export function UsersToolbar({
  userType,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddUser,
}: UsersToolbarProps) {
  const [open, setOpen] = useState(false)

  const isTeacher = userType === "teachers"
  const isStudent = userType === "students"
  const title = isTeacher ? "Teachers" : isStudent ? "Students" : "Parents"
  const description = isTeacher
    ? "Manage your teaching staff"
    : isStudent
      ? "Manage student records and enrollment"
      : "Manage parents information"

  const placeholder = isTeacher
    ? "Search teachers..."
    : isStudent
      ? "Search students..."
      : "Search parents..."

  const addButtonText = isTeacher
    ? "Add Teacher"
    : isStudent
      ? "Add Student"
      : "Add Parent"

  const filterAllText = isTeacher
    ? "All Teachers"
    : isStudent
      ? "All Students"
      : "All Parents"

  return (
    <div className="mt-2 mb-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button
          onClick={onAddUser}
          className="w-full rounded-xl font-medium sm:w-auto lg:w-[357px]"
        >
          <Plus className="mr-2 h-5 w-5" />
          {addButtonText}
        </Button>
      </div>
      <div className="flex flex-row gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="placeholder:text-muted-foreground/70 h-11 rounded-lg border bg-white pl-11 text-base sm:w-auto lg:w-[272px]"
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
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={onStatusFilterChange}
            >
              <DropdownMenuRadioItem value="all">{filterAllText}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
