"use client"

import React, { FC, SVGProps } from "react"
import {
  LucideIcon,
  GraduationCap,
  Book,
  Check,
  Table,
  FlaskConicalOff,
  BookOpen,
  Dot,
} from "lucide-react"
import { BiMath } from "react-icons/bi"

// Type definitions
interface Stat {
  label: string
  value: string
  icon: LucideIcon
}

interface ScheduleItem {
  subject: string
  time: string
  room: string
  icon: LucideIcon | FC<SVGProps<SVGSVGElement>>
  Teacher: string
}

interface Assignment {
  title: string
  subject: string
  dueDate: string
  status: string
}

interface Event {
  title: string
  date: string
  icon: LucideIcon
  color: string
}

type AttendanceValue = number | ""

const Overview = () => {
  const stats: Stat[] = [
    { label: "Today's Class", value: "3", icon: GraduationCap },
    { label: "Pending Assignments", value: "5", icon: Book },
    { label: "Attendance", value: "80%", icon: Check },
    { label: "Upcoming Events", value: "2", icon: Table },
  ]

  const schedule: ScheduleItem[] = [
    {
      subject: "Chemistry",
      time: "8:00 AM - 9:00 AM",
      room: "Chemistry Lab1",
      icon: FlaskConicalOff,
      Teacher: "Mr. Anderson Peter ",
    },
    {
      subject: "Mathematics",
      time: "9:15 AM - 10:15 AM",
      room: "Chemistry Lab1",
      icon: BiMath,
      Teacher: "Mr. Anderson Peter",
    },
    {
      subject: "English",
      time: "10:30 AM - 11:30 AM",
      room: "Chemistry Lab1",
      icon: BookOpen,
      Teacher: "Mr. Anderson Peter",
    },
  ]

  const assignments: Assignment[] = [
    {
      title: "What are nuclear particles",
      subject: "Chemistry",
      dueDate: "Due Today",
      status: "Today, 14:30s",
    },
    {
      title: "Make a history portfolio",
      subject: "History",
      dueDate: "Due Today",
      status: "Today, 16:00s",
    },
    {
      title: "What are Atoms",
      subject: "Chemistry",
      dueDate: "Tomorrow",
      status: "Dec 03, 15:30s",
    },
    {
      title: "Make a time machine",
      subject: "Science",
      dueDate: "Saturday",
      status: "Dec 04, 10:00s",
    },
  ]

  const attendanceData: AttendanceValue[][] = [
    ["", 92, 93, 95, 90, 88, 94],
    [91, 93, 89, 92, 95, 91, 90],
    [88, 90, 94, 89, 91, 93, 87],
    [95, 89, 92, 90, 88, 91, 89],
    [90, 94, 88, 93, 89, 92, 95],
  ]

  const events: Event[] = [
    {
      title: "Mid Term Break",
      date: "21 December to 02:00",
      icon: Table,
      color: "bg-blue-50",
    },
    {
      title: "Christmas carol",
      date: "21 December to 02:00",
      icon: Table,
      color: "bg-red-50",
    },
  ]

  const getAttendanceColor = (value: AttendanceValue): string => {
    if (value === "") return "bg-white"
    if (value >= 93) return "bg-green-300"
    if (value >= 90) return "bg-red-300"
    if (value >= 88) return "bg-green-300"
    return "bg-red-300"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border bg-white p-4 py-7"
              >
                <stat.icon className="text-accent" />
                <div>
                  <div className="mb-1 text-sm text-gray-600">{stat.label}</div>
                  <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Today's Timetable */}
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  Today&apos;s Timetable
                </h2>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="rounded-xl bg-[#E6E6E6] p-2 text-3xl">
                        <item.icon className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.subject}</div>
                        <div className="text-sm text-gray-600">{item.time}</div>
                        <div className="text-sm text-gray-600">
                          Teacher: {item.Teacher}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{item.room}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 border-b pb-4 text-lg font-semibold text-gray-800">
                  Assignments
                </h2>
                <div className="space-y-3">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="grid grid-cols-[2fr_60fr_15fr] p-3">
                      <Dot />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {assignment.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {assignment.subject}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-red-600">
                          {assignment.dueDate}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">Status:To Do</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 border-b pb-1.5 text-lg font-semibold text-gray-800">
                  Performance Overview
                </h2>

                <h3 className="text-text-secondary text-xl font-normal lg:text-2xl">
                  Current Term (First 2023)
                </h3>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-base font-medium text-gray-600">
                      Average Grade
                    </span>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-400">
                      <span className="text-text-secondary text-[0.625rem] font-medium">
                        90% <br /> B+
                      </span>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-base font-medium text-gray-600">Class Position</p>
                    <span className="mb-3 text-2xl font-bold text-gray-800">3/15</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-3 text-xs">
                        <span className="text-gray-600">Term Progress</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-gray-600">Begin Term</span>
                        <span className="font-medium">End Term</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Attendance</h2>
                  <span className="text-sm text-gray-600">November 2025</span>
                </div>
                <div className="mb-3">
                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600">
                    <div>Su</div>
                    <div>Mo</div>
                    <div>Tu</div>
                    <div>We</div>
                    <div>Th</div>
                    <div>Fr</div>
                    <div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {attendanceData.flat().map((value, index) => (
                      <div
                        key={index}
                        className={`aspect-square ${getAttendanceColor(value)} flex items-center justify-center rounded text-xs font-medium ${
                          value === "" ? "" : "text-gray-700"
                        }`}
                      >
                        {value !== "" && (index % 7) + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded bg-green-300"></div>
                      <span className="text-gray-600">Excellent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded bg-yellow-300"></div>
                      <span className="text-gray-600">Absent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  Upcoming Events
                </h2>
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className={
                        "flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                      }
                    >
                      <div className="bg-accent/10 text-3xl">
                        <event.icon className="text-accent" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{event.title}</div>
                        <div className="text-sm text-gray-600">{event.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Overview
