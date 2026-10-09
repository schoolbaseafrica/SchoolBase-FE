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

  // Desktop navigation is visible by default; mobile continues to use the overlay menu.
  return (
    <SidebarProvider defaultOpen>
      <StudentSidebar />
      <main className="portal-shell max-w-full min-w-0 flex-1 overflow-x-clip">
        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}
