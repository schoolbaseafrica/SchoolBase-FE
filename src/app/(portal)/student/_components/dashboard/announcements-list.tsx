"use client"

import { Table } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import type { Announcement } from "@/lib/api/student"

interface AnnouncementsListProps {
  announcements: Announcement[]
  isLoading?: boolean
}

export function AnnouncementsList({ announcements, isLoading }: AnnouncementsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Announcements</h2>
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="py-4 text-center text-gray-500">No announcements at this time</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="bg-accent/10 text-3xl">
                <Table className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{announcement.title}</div>
                <div className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {announcement.content}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {format(new Date(announcement.created_at), "MMM dd, yyyy")}
                  {announcement.author_name && ` • ${announcement.author_name}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
