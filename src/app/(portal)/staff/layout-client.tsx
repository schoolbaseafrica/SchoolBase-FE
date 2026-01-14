"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { StaffSidebar } from "@/components/dashboard/staff-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <StaffSidebar />
      <main className="min-h-screen w-full pt-10 lg:pt-20">
        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}
