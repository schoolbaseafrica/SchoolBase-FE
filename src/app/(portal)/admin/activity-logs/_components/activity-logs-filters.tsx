"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ActivityAction,
  ActivityLogsAPI,
  activityActionLabel,
  activityEntityLabel,
} from "@/lib/activity-logs"
import { X } from "lucide-react"

interface ActivityLogsFiltersProps {
  onFiltersChange: (filters: {
    user?: string
    entityType?: string
    action?: ActivityAction | "all"
    startDate?: string
    endDate?: string
  }) => void
  initialFilters?: {
    user?: string
    entityType?: string
    action?: ActivityAction | "all"
    startDate?: string
    endDate?: string
  }
}

export function ActivityLogsFilters({
  onFiltersChange,
  initialFilters = {},
}: ActivityLogsFiltersProps) {
  const [entityType, setEntityType] = useState(initialFilters.entityType || "all")
  const [action, setAction] = useState<ActivityAction | "all">(
    initialFilters.action || "all"
  )
  const [startDate, setStartDate] = useState(initialFilters.startDate || "")
  const [endDate, setEndDate] = useState(initialFilters.endDate || "")
  const options = useQuery({
    queryKey: ["activity-log-filter-options"],
    queryFn: ActivityLogsAPI.getFilterOptions,
  })

  useEffect(() => {
    onFiltersChange({
      entityType: entityType === "all" ? undefined : entityType,
      action: action === "all" ? undefined : action,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }, [entityType, action, startDate, endDate, onFiltersChange])

  const hasFilters =
    (entityType && entityType !== "all") ||
    (action && action !== "all") ||
    startDate ||
    endDate

  const clearFilters = () => {
    setEntityType("all")
    setAction("all")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[180px] flex-1">
          <label className="text-foreground mb-2 block text-sm font-medium">
            Entity Type
          </label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="All Entity Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entity Types</SelectItem>
              {(options.data?.entity_types ?? []).map((type) => (
                <SelectItem key={type} value={type}>
                  {activityEntityLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px] flex-1">
          <label className="text-foreground mb-2 block text-sm font-medium">Action</label>
          <Select
            value={action}
            onValueChange={(value) => setAction(value as ActivityAction | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {(options.data?.actions ?? []).map((action) => (
                <SelectItem key={action} value={action}>
                  {activityActionLabel(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="text-foreground mb-2 block text-sm font-medium">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="text-foreground mb-2 block text-sm font-medium">
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
      {options.isError && (
        <p className="text-destructive text-sm">Could not load filter choices.</p>
      )}
    </div>
  )
}
