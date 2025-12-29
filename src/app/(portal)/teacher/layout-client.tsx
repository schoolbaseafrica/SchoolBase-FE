"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function TeacherLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isClassroomRoute = pathname?.includes("/classroom/")

  // For classroom routes, don't render sidebar and header
  if (isClassroomRoute) {
    return <>{children}</>
  }

  // For other routes, render with sidebar and header
  return (
    <SidebarProvider defaultOpen={false}>
      <TeacherSidebar />
      <main className="min-h-screen w-full pt-10 lg:pt-20">
        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}
