import type { Metadata } from "next"
import React from "react"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { UserProvider } from "@/providers/user-provider"

export const metadata: Metadata = {
  title: "Teacher Dashboard | School Base",
  description:
    "Manage classes, attendance, results, and communication with students and parents.",
}

export default function Teacherlayout({ children }: { children: React.ReactNode }) {
  return (
    <GeneralQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <TeacherSidebar />
          <main className="min-h-screen w-full pt-10 lg:pt-20">
            <DashboardHeader />

            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </GeneralQueryProvider>
  )
}
