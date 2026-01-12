import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Oversee school operations, approvals, and insights across the School Base platform.",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <SidebarProvider>
          <AdminSidebar />
          <main className="mt-[50px] h-full w-full bg-white">
            <DashboardHeader />
            <PageViewTracker />
            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </QueryProvider>
  )
}
