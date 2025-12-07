import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ParentSidebar } from "@/components/dashboard/parent-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { UserProvider } from "@/providers/user-provider"
import { StudentProvider } from "./_components/student-provider"

export const metadata: Metadata = {
  title: "Parent Dashboard | School Base",
  description:
    "Track student progress, attendance, payments, and communication in School Base.",
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <GeneralQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <ParentSidebar />
          <StudentProvider>
            <main className="mt-[50px] h-full w-full">
              <DashboardHeader />
              {children}
            </main>
          </StudentProvider>
        </SidebarProvider>
      </UserProvider>
    </GeneralQueryProvider>
  )
}
