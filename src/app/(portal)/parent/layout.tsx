import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ParentSidebar } from "@/components/dashboard/parent-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"
import { StudentProvider } from "./_components/student-provider"
import { ParentRouteGuard } from "./_components/parent-route-guard"

export const metadata: Metadata = {
  title: "Parent Dashboard",
  description:
    "Track student progress, attendance, payments, and communication in School Base.",
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <ParentRouteGuard>
          <SidebarProvider>
            <ParentSidebar />
            <StudentProvider>
              <main className="mt-[50px] h-full w-full">
                <DashboardHeader />
                {children}
              </main>
            </StudentProvider>
          </SidebarProvider>
        </ParentRouteGuard>
      </UserProvider>
    </QueryProvider>
  )
}
