"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTodayActivities } from "../../_hooks/today-activity"

const TodayActivityGrid = ({
  highlightedIndex,
  showAll,
  search,
}: {
  highlightedIndex: number | null
  showAll: boolean
  search?: string
}) => {
  const { data, isLoading } = useTodayActivities()
  if (isLoading)
    return <p className="py-10 text-center lg:hidden">Loading activities...</p>

  const activities = data?.todays_activities ?? []

  if (activities.length === 0) return <p className="py-10 text-center">No Activity yet</p>

  const filteredActivities = search
    ? activities.filter(
        (act) =>
          act?.teacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          act?.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
          act?.class?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : activities

  return (
    <div className="w-full space-y-6 lg:hidden">
      {filteredActivities.map((activity, i) => (
        <Card
          key={activity.schedule_id}
          id={`activity-${i}`}
          className={`${highlightedIndex === i ? "bg-accent/10 ring-accent ring-2 transition-all" : ""} ${
            !showAll && i >= 5 ? "hidden" : ""
          }`}
        >
          <CardContent className="grid grid-cols-[2fr_1fr_1fr] gap-2 px-2 py-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-xs font-medium">Teacher:</span>
              <p className="text-sm font-medium">
                {activity?.teacher?.full_name || "Unassigned"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-xs font-medium">Subject:</span>
              <p className="text-sm font-medium">
                {activity?.subject?.name || "Unassigned"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-xs font-medium">Class:</span>
              <p className="text-sm font-medium">
                {activity?.class?.name || "Unassigned"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-sm font-medium">Time:</span>
              <p className="text-sm font-medium">
                {activity?.start_time} - {activity?.end_time}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-xs font-medium">Venue:</span>
              <p className="text-sm font-medium">{activity?.venue}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-primary text-xs font-medium">Status:</span>
              <span
                className={`rounded-2xl px-2 py-0.5 text-xs font-medium ${
                  activity?.progress_status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                } `}
              >
                {activity?.progress_status || "Unassigned"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TodayActivityGrid
