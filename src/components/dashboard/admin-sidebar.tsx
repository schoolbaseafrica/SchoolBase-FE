"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Settings,
  BookIcon,
  Menu,
  Calendar,
  School,
} from "lucide-react"
import { PiMoneyWavyBold } from "react-icons/pi"
import { FaRegUser } from "react-icons/fa6"
import { TbSettingsCog } from "react-icons/tb"
import NotePad from "../../../public/svgs/note-pad"
import Users from "../../../public/svgs/users"
import { SidebarFooterUser } from "../sidebar-footer-user"

import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Logo from "@/components/logo"

// Menu items
const mainItems = [
  { title: "Dashboard", url: "/admin", icon: Menu, exactMatch: true },
  {
    title: "Fees",
    url: "/admin/fees",
    icon: PiMoneyWavyBold,
    subItems: [
      { title: "Fees Records & Analytics", url: "/admin/fees-record" },
      { title: "Fee Management", url: "/admin/fee-management" },
    ],
  },
  { title: "Attendance", url: "/admin/attendance", icon: NotePad },

  {
    title: "Timetable",
    url: "/admin/timetable",
    icon: Calendar,
    subItems: [
      { title: "Timetable View", url: "/admin/timetable" },
      { title: "Timetable Setup", url: "/admin/timetable" },
    ],
  },
  { title: "Results", url: "/admin/results", icon: Calendar },
  { title: "Teachers", url: "/admin/teachers", icon: Users },
  { title: "Students", url: "/admin/students", icon: GraduationCap },
  { title: "Parents", url: "/admin/parents", icon: FaRegUser },
  {
    title: "Class Management",
    url: "/admin/class-management",
    icon: BookIcon,
    subItems: [
      // { title: "Result Management", url: "/admin/results" },
      { title: "Classes (per session)", url: "/admin/class-management/class" },
    ],
  },
  {
    title: "School Structure",
    url: "/admin/class-management/session",
    icon: School,
    subItems: [
      { title: "Session", url: "/admin/class-management/session" },
      { title: "Subjects", url: "/admin/class-management/subjects" },
      { title: "Room", url: "/admin/class-management/classrooms" },
    ],
  },
  { title: "User Configuration", url: "/admin/user-configuration", icon: TbSettingsCog },
  // { title: "User Configuration", url: "/admin/user-configuration", icon: AiOutlinePieChart },
]

const bottomItems = [
  // { title: "Support", url: "/admin/support", icon: HelpCircle },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const [openItems, setOpenItems] = useState<string[]>([])

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
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {mainItems.map((item) => {
                const hasSubItems = "subItems" in item && item.subItems
                const isActive = item.exactMatch
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(item.url + "/")
                const isOpen = openItems.includes(item.title)
                const hasActiveChild =
                  hasSubItems &&
                  item.subItems?.some((subItem) => pathname === subItem.url)

                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 ${
                              isActive || hasActiveChild
                                ? "bg-[#DA3743] text-white hover:bg-[#DA3743] hover:text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex w-full cursor-pointer items-center justify-between">
                              <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{item.title}</span>
                              </div>
                              {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mt-1 ml-8 space-y-1 border-l-0 px-0">
                            {item.subItems?.map((subItem) => {
                              const isSubActive = pathname === subItem.url
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={`rounded-md px-3 py-2 ${
                                      isSubActive
                                        ? "text-[#DA3743]"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  >
                                    <Link href={subItem.url} onClick={handleLinkClick}>
                                      <span className="text-sm">{subItem.title}</span>
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
        </div>
      </SidebarContent>

      <SidebarFooterUser />
    </Sidebar>
  )

  function toggleItem(title: string) {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  function handleLinkClick() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
}
