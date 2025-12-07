import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { UserProvider } from "@/providers/user-provider"

export const metadata: Metadata = {
  title: "Student Dashboard | School Base",
  description:
    "View classes, attendance, results, and updates from your school in one place.",
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <GeneralQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <StudentSidebar />
          <main className="mt-[50px] h-full w-full">
            <DashboardHeader />
            {children}
          </main>
        </SidebarProvider>
      </UserProvider>
    </GeneralQueryProvider>
  )
}
