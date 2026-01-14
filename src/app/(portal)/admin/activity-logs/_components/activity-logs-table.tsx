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
import { ActivityLog, ActivityAction } from "@/lib/activity-logs"
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
  isLoading?: boolean
  isError?: boolean
  error?: string
}

const actionColors: Record<ActivityAction, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
}

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
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">No activity logs found</p>
          <p className="mt-2 text-sm text-gray-500">
            Activity logs will appear here as users perform actions in the system.
          </p>
        </div>
      </div>
    )
  }

  const description = selectedLog?.description || `${selectedLog?.action} ${selectedLog?.entity_type}`

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.user_name}</div>
                      <div className="text-sm text-gray-500">{log.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action]}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.entity_type}</TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="cursor-pointer truncate text-primary hover:underline"
                      onClick={() => handleDescriptionClick(log)}
                      title="Click to view full description"
                    >
                      {logDescription}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(log.created_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Log Description</DialogTitle>
            <DialogDescription>
              Full description of the activity log entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLog && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-700">User</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.user_name}</p>
                    <p className="text-xs text-gray-500">{selectedLog.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Action</p>
                    <Badge className={actionColors[selectedLog.action]}>{selectedLog.action}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Entity Type</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.entity_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date & Time</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
