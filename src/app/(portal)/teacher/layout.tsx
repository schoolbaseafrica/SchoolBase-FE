import type { Metadata } from "next"
import React from "react"
import { QueryProvider } from "@/providers/query-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { UserProvider } from "@/providers/user-provider"
import TeacherLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description:
    "Manage classes, attendance, results, and communication with students and parents.",
}

export default function Teacherlayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <TeacherLayoutClient>{children}</TeacherLayoutClient>
      </UserProvider>
    </QueryProvider>
  )
}
