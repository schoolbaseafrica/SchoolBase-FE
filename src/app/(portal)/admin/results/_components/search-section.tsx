"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, ListFilter } from "lucide-react"

interface SearchSectionProps {
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
}

const statusOptions = [
  { value: "all", label: "All Submissions" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

export function SearchSection({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: SearchSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-row gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <Input
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11"
        />
      </div>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`justify-between ${open ? "bg-gray-100" : ""}`}
          >
            <ListFilter className="hidden h-4 w-4 sm:block" />
            {open ? (
              <ChevronDown className="h-2 w-4 sm:hidden" />
            ) : (
              <ChevronDown className="h-2 w-4 sm:hidden" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuRadioGroup
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            {statusOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
