"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import { Menu, GraduationCap } from "lucide-react"

import { LuCalendarCheck } from "react-icons/lu"
import NotePad from "../../../public/svgs/note-pad"

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

import { SidebarFooterUser } from "../sidebar-footer-user"

import Logo from "@/components/logo"

// ----------------------------
// MENU CONFIG
// ----------------------------
const items = [
  { title: "Dashboard", url: "/teacher", icon: Menu, exactMatch: true },

  { title: "Timetable", url: "/teacher/timetable", icon: LuCalendarCheck },
  { title: "Attendance", url: "/teacher/attendance", icon: NotePad },
  { title: "Students", url: "/teacher/students", icon: GraduationCap },
  { title: "Results", url: "/teacher/results", icon: NotePad },
]

// ----------------------------
// COMPONENT
// ----------------------------
export function TeacherSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()

  const isCollapsed = state === "collapsed"

  // Auto close on mobile click
  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar>
      {/* HEADER */}
      <SidebarHeader>
        <div className="flex h-16 items-center justify-between px-4">
          <div className={isCollapsed ? "hidden" : ""}>
            <Logo />
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* CONTENT */}
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
                          ? "bg-[#DA3743] text-white hover:bg-[#DA3743] hover:text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Link
                        href={item.url}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3"
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
      </SidebarContent>

      <SidebarFooterUser />
    </Sidebar>
  )
}
