import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { UserProvider } from "@/providers/user-provider"

export const metadata: Metadata = {
  title: "Admin Dashboard | School Base",
  description:
    "Oversee school operations, approvals, and insights across the School Base platform.",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <GeneralQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <AdminSidebar />
          <main className="mt-[50px] h-full w-full bg-white">
            <DashboardHeader />
            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </GeneralQueryProvider>
  )
}
