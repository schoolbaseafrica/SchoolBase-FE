"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutGrid,
  GraduationCap,
  CalendarDays,
  FileBadge,
  SettingsIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Logo from "@/components/logo"
import { SidebarFooterUser } from "../sidebar-footer-user"

// Menu items
const items = [
  { title: "Dashboard", url: "/student", icon: LayoutGrid, exactMatch: true },
  { title: "Results", url: "/student/results", icon: FileBadge },
  { title: "Timetable", url: "/student/timetable", icon: CalendarDays },
  { title: "Attendance", url: "/student/attendance", icon: GraduationCap },
]

const bottomItems = [
  // { title: "Help", url: "/teacher/support", icon: HelpCircle },
  { title: "Settings", url: "/student/settings", icon: SettingsIcon },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()

  // Close mobile sidebar when link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center justify-between px-4">
          <div className={isCollapsed ? "hidden" : ""}>
            <Logo />
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.exactMatch
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/")

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-md px-3 py-2.5 ${
                        isActive
                          ? "bg-[var(--primary)] text-[var(--accent-foreground)] hover:bg-[var(--primary)] hover:text-[var(--accent-foreground)]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Link
                        href={item.url || "#"}
                        className="flex items-center gap-3"
                        onClick={handleLinkClick}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Items */}
        <div className="mt-auto px-3 pb-2">
          <SidebarMenu className="space-y-1">
            {bottomItems.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-md px-3 py-2.5 ${
                      isActive
                        ? "bg-[var(--primary)] text-[var(--accent-foreground)] hover:bg-[var(--primary)] hover:text-[var(--accent-foreground)]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Link
                      href={item.url || "#"}
                      className="flex items-center gap-3"
                      onClick={handleLinkClick}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooterUser />
    </Sidebar>
  )
}
