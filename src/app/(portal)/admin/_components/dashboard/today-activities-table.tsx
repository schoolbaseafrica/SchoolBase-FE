"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTodayActivities } from "../../_hooks/today-activity"

const TodayActivities = ({
  highlightedIndex,
  showAll,
  search,
}: {
  highlightedIndex: number | null
  showAll: boolean
  search?: string
}) => {
  const { data, isLoading } = useTodayActivities()
  // console.log("activity", data)
  if (isLoading) {
    return <p className="hidden py-10 text-center lg:block">Loading activities...</p>
  }

  const activities = data?.todays_activities ?? []

  if (activities.length === 0) {
    return (
      <div className="hidden lg:block">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="py-10 text-center" colSpan={8}>
                No Activity yet
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  // Filter by search term if provided
  // Filter by search term if provided
  const filteredActivities = search
    ? activities.filter(
        (act) =>
          act?.teacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          act?.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
          act?.class?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : activities
  // const filteredActivities = search
  //   ? activities.filter(
  //       (act) =>
  //         act?.teacher?.full_name.toLowerCase().includes(search.toLowerCase()) ||
  //         act.subject.name.toLowerCase().includes(search.toLowerCase()) ||
  //         act.class.name.toLowerCase().includes(search.toLowerCase())
  //     )
  //   : activities

  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader className="bg-tint h-13">
          <TableRow>
            <TableHead></TableHead>
            <TableHead className="w-[150px] px-4 py-2.5 text-center">Teacher</TableHead>
            <TableHead className="px-4 py-2.5">Subject</TableHead>
            <TableHead className="px-4 py-2.5 text-center">Time</TableHead>
            <TableHead className="px-4 py-2.5 text-center">Status</TableHead>
            <TableHead className="px-4 py-2.5 text-center">Class</TableHead>
            <TableHead className="px-4 py-2.5 text-center">Venue</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredActivities.map((activity, i) => (
            <TableRow
              key={activity.schedule_id}
              id={`activity-${i}`}
              className={`${highlightedIndex === i ? "bg-accent/10 transition-all" : ""} ${
                !showAll && i >= 5 ? "hidden" : ""
              }`}
            >
              <TableCell className="px-4 py-2.5">{i + 1}</TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                {activity?.teacher?.full_name || "Unassigned"}
              </TableCell>
              <TableCell className="px-4 py-2.5">
                {activity?.subject?.name || "Unassigned"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                {activity?.start_time} - {activity?.end_time}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                <span
                  className={`rounded-2xl px-2 py-0.5 text-xs font-medium ${
                    activity?.progress_status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  } `}
                >
                  {activity?.progress_status || "Unassigned"}
                </span>
              </TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                {activity?.class?.name || "Unassigned"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                {activity?.venue || "Unassigned"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TodayActivities
