"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ActivityLog,
  activityActionLabel,
  activityEntityLabel,
} from "@/lib/activity-logs"
import { ItemLoader } from "@/app/(portal)/admin/_components/sub-loader"
import { ItemsError } from "@/app/(portal)/admin/_components/loading-error"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ActivityLogsTableProps {
  logs: ActivityLog[]
  offset?: number
  isLoading?: boolean
  isError?: boolean
  error?: string
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  ACTIVATE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  PUBLISH: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  MARK: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  RECORD: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  DEACTIVATE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
}

const detailLabel = (key: string) =>
  key.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase())

const detailValue = (value: unknown): string => {
  if (value === null || value === undefined) return "None"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.map(detailValue).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

const badgeClass = (action: string) =>
  actionColors[action] ?? "bg-primary/10 text-primary"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ActivityLogsTable({
  logs,
  offset = 0,
  isLoading = false,
  isError = false,
  error,
}: ActivityLogsTableProps) {
  const router = useRouter()
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDescriptionClick = (log: ActivityLog) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  if (isLoading) {
    return <ItemLoader item="activity logs" />
  }

  if (isError) {
    return (
      <ItemsError
        item="Activity Logs"
        errorMessage={error || "Failed to load activity logs"}
        reload={() => router.refresh()}
      />
    )
  }

  if (logs.length === 0) {
    return (
      <div className="border-border bg-card flex min-h-[320px] items-center justify-center rounded-xl border p-8 text-center shadow-sm">
        <div className="text-center">
          <p className="text-foreground text-lg font-medium">No activity logs found</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Try another filter or date range. Recorded actions appear here after they
            occur.
          </p>
        </div>
      </div>
    )
  }

  const description =
    selectedLog?.description || `${selectedLog?.action} ${selectedLog?.entity_type}`

  return (
    <>
      <div className="border-border bg-card overflow-x-auto rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">S/N</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => {
              const logDescription = log.description || `${log.action} ${log.entity_type}`
              return (
                <TableRow key={log.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{offset + index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.user_name?.trim() || "Former user"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {log.user_email || log.user_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={badgeClass(log.action)}>
                      {activityActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {activityEntityLabel(log.entity_type)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <button
                      type="button"
                      className="text-primary block max-w-xs truncate text-left hover:underline focus-visible:underline"
                      onClick={() => handleDescriptionClick(log)}
                      title="View activity details"
                    >
                      {logDescription}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(log.created_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="activity-log-description">
          <DialogHeader>
            <DialogTitle>Activity Log Description</DialogTitle>
            <DialogDescription id="activity-log-description">
              Full description of the activity log entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLog && (
              <>
                <div>
                  <p className="text-foreground text-sm font-medium">Description</p>
                  <p className="text-foreground mt-1 text-sm break-words whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">User</p>
                    <p className="text-foreground mt-1 text-sm">
                      {selectedLog.user_name?.trim() || "Former user"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {selectedLog.user_email || selectedLog.user_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Action</p>
                    <Badge className={badgeClass(selectedLog.action)}>
                      {activityActionLabel(selectedLog.action)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Entity Type</p>
                    <p className="text-foreground mt-1 text-sm">
                      {activityEntityLabel(selectedLog.entity_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">Date & Time</p>
                    <p className="text-foreground mt-1 text-sm">
                      {formatDate(selectedLog.created_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-foreground text-sm font-medium">Record ID</p>
                  <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
                    {selectedLog.entity_id}
                  </p>
                </div>
                {(
                  [
                    ["Before", selectedLog.old_values],
                    ["After", selectedLog.new_values],
                    ["Details", selectedLog.metadata],
                  ] as const
                ).map(
                  ([label, value]) =>
                    value &&
                    Object.keys(value).length > 0 && (
                      <div key={label} className="border-t pt-4">
                        <p className="text-foreground text-sm font-medium">{label}</p>
                        <dl className="divide-border border-border bg-muted/30 mt-2 divide-y rounded-md border px-3">
                          {Object.entries(value).map(([key, item]) => (
                            <div
                              key={key}
                              className="grid gap-1 py-2 text-sm sm:grid-cols-[10rem_1fr]"
                            >
                              <dt className="text-muted-foreground">
                                {detailLabel(key)}
                              </dt>
                              <dd className="text-foreground break-all">
                                {detailValue(item)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
