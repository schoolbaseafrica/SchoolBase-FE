"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { ParentSidebar } from "@/components/dashboard/parent-sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"
import { StudentProvider } from "./_components/student-provider"
import { ParentRouteGuard } from "./_components/parent-route-guard"
import { usePathname } from "next/navigation"

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAutoLoginPage = pathname === "/parent/auto-login"

  return (
    <QueryProvider>
      <UserProvider>
        <ParentRouteGuard>
          {isAutoLoginPage ? (
            // For auto-login page, render without sidebar/header
            <>{children}</>
          ) : (
            // For other pages, render with sidebar/header
            <SidebarProvider>
              <ParentSidebar />
              <StudentProvider>
                <main className="mt-[50px] h-full w-full">
                  <DashboardHeader />
                  {children}
                </main>
              </StudentProvider>
            </SidebarProvider>
          )}
        </ParentRouteGuard>
      </UserProvider>
    </QueryProvider>
  )
}
