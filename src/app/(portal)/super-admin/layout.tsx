import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { QueryProvider } from "@/providers/query-provider"
import { SuperAdminSidebar } from "@/components/dashboard/super-admin-sidebar"
import { UserProvider } from "@/providers/user-provider"

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description:
    "Oversee multiple schools, onboard teams, and manage platform-wide settings within School Base.",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <SidebarProvider>
          <SuperAdminSidebar />
          <main className="portal-shell max-w-full min-w-0 flex-1 overflow-x-clip">
            <DashboardHeader />
            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </QueryProvider>
  )
}
