"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Menu,
  GraduationCap,
  User,
  ChevronDown,
  ChevronRight,
  NotebookPen,
  CalendarDays,
  LifeBuoy,
} from "lucide-react"
import { PiMoneyWavyBold } from "react-icons/pi"

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Logo from "@/components/logo"

import { SidebarFooterUser } from "../sidebar-footer-user"

// Menu items
const items = [
  { title: "Dashboard", url: "/super-admin", icon: Menu, exactMatch: true },
  { title: "Admins", url: "/super-admin/admins", icon: User },
  { title: "Teachers", url: "/super-admin/teachers", icon: User },
  { title: "Students", url: "/super-admin/students", icon: GraduationCap },
  { title: "Parents", url: "/super-admin/parents", icon: User },
  {
    title: "Classes and Sessions",
    url: "/super-admin/classes-and-sessions",
    icon: NotebookPen,
  },
  {
    title: "Fees",
    url: "/super-admin/fees",
    icon: PiMoneyWavyBold,
    subItems: [
      { title: "Add Fee Group", url: "/super-admin/fees/add-fees" },
      { title: "Allocate Invoice", url: "/super-admin/fees/allocate-invoice" },
      { title: "Record Payment", url: "/super-admin/fees/record-payment" },
    ],
  },
  { title: "Analytics", url: "/super-admin/analytics", icon: CalendarDays },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  // Close mobile sidebar when link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isCollapsed = state === "collapsed"

  // Check if any sub-item is active
  const isParentActive = (item: (typeof items)[number]) => {
    if ("subItems" in item && item.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.url)
    }
    return false
  }

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
                const hasSubItems = "subItems" in item && item.subItems
                const isActive = item.exactMatch
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/")
                const isOpen = openItems.includes(item.title)
                const hasActiveChild = hasSubItems && isParentActive(item)

                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <SidebarMenuItem>
                        <div className="flex w-full items-center">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={`flex-1 ${
                                isActive
                                  ? "bg-[#DA3743]/10 text-[#DA3743]"
                                  : hasActiveChild
                                    ? ""
                                    : "text-gray-700 hover:bg-[#DA3743]/10 hover:text-[#DA3743]"
                              }`}
                            >
                              <Link
                                href={item.url || "#"}
                                className="flex items-center gap-2"
                                onClick={handleLinkClick}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mx-0 ml-4 border-l-0 px-0">
                            {item.subItems.map((subItem) => {
                              const isSubActive = pathname === subItem.url
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={`my-1.5 ${
                                      isSubActive
                                        ? "bg-[#DA3743]/10 text-[#DA3743]"
                                        : "text-gray-600 hover:bg-[#DA3743]/10 hover:text-[#DA3743]"
                                    }`}
                                  >
                                    <Link href={subItem.url} onClick={handleLinkClick}>
                                      {subItem.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

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

      <SidebarFooter className="cursor-pointer">
        <div className="flex items-center gap-2 text-sm">
          <LifeBuoy className="h-4 w-4" />
          <span>Support</span>
        </div>
      </SidebarFooter>

      <SidebarFooterUser />
    </Sidebar>
  )
}
