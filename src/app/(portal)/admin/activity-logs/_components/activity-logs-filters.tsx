"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ActivityAction } from "@/lib/activity-logs"
import { X } from "lucide-react"

interface ActivityLogsFiltersProps {
  onFiltersChange: (filters: {
    user?: string
    entityType?: string
    action?: ActivityAction | ""
    startDate?: string
    endDate?: string
  }) => void
  initialFilters?: {
    user?: string
    entityType?: string
    action?: ActivityAction | ""
    startDate?: string
    endDate?: string
  }
}

const entityTypes = [
  "Student",
  "Class",
  "Teacher",
  "Parent",
  "Fee",
  "Subject",
  "Room",
  "Session",
  "User",
]

const actionOptions: { value: ActivityAction | ""; label: string }[] = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
]

export function ActivityLogsFilters({
  onFiltersChange,
  initialFilters = {},
}: ActivityLogsFiltersProps) {
  const [entityType, setEntityType] = useState(initialFilters.entityType || "")
  const [action, setAction] = useState<ActivityAction | "">(initialFilters.action || "")
  const [startDate, setStartDate] = useState(initialFilters.startDate || "")
  const [endDate, setEndDate] = useState(initialFilters.endDate || "")

  useEffect(() => {
    onFiltersChange({
      entityType: entityType || undefined,
      action: action || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }, [entityType, action, startDate, endDate, onFiltersChange])

  const hasFilters = entityType || action || startDate || endDate

  const clearFilters = () => {
    setEntityType("")
    setAction("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Entity Type
          </label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="All Entity Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Entity Types</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px] flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">Action</label>
          <Select
            value={action}
            onValueChange={(value) => setAction(value as ActivityAction | "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
          />
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="mb-0">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
