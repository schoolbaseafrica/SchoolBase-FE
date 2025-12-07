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
        <div className="flex h-7 items-center justify-between px-2 py-4">
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
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-[#DA3743]/10 text-[#DA3743]"
                          : "text-primary hover:bg-[#DA3743]/10 hover:text-[#DA3743]"
                      }
                    >
                      <Link
                        href={item.url || "#"}
                        className="flex items-center gap-2"
                        onClick={handleLinkClick}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
