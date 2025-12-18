import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "View classes, attendance, results, and updates from your school in one place.",
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <SidebarProvider>
          <StudentSidebar />
          <main className="mt-[50px] h-full w-full">
            <DashboardHeader />
            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </QueryProvider>
  )
}
