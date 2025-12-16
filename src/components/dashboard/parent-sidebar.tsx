"use client"

// import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, CalendarDays, FileBadge } from "lucide-react"
import { PiMoneyWavyBold } from "react-icons/pi"
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
  // SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

import Logo from "@/components/logo"

import { SidebarFooterUser } from "../sidebar-footer-user"

const items = [
  { title: "Dashboard", url: "/parent", icon: Menu, exactMatch: true },
  { title: "Fees", url: "/parent/fee-management", icon: PiMoneyWavyBold },
  { title: "Results", url: "/parent/results", icon: FileBadge },
  { title: "Timetable", url: "/parent/timetable", icon: CalendarDays },
  { title: "Attendance", url: "/parent/attendance", icon: NotePad },
]

export function ParentSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()

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
                          ? "bg-[#DA3743] text-white hover:bg-[#DA3743] hover:text-white"
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
      </SidebarContent>

      <SidebarFooterUser />
    </Sidebar>
  )
}
