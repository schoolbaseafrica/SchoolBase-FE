"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isClassroomRoute = pathname?.includes("/classroom/")

  // For classroom routes, don't render sidebar and header - let the page handle full screen
  if (isClassroomRoute) {
    return <>{children}</>
  }

  // For other routes, render with sidebar and header (sidebar collapsed by default)
  return (
    <SidebarProvider defaultOpen={false}>
      <StudentSidebar />
      <main className="mt-[50px] h-full w-full">
        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}
