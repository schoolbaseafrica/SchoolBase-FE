"use client"

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import {
  Bell,
  Building2,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  ScanFace,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface SettingsSidebarProps {
  activeTab: string
}

export const SettingsSidebar = ({ activeTab }: SettingsSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      id: "school-info",
      label: "School Information",
      icon: Building2,
    },
    {
      id: "landing-page",
      label: "Public Website",
      icon: ImageIcon,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "attendance",
      label: "Attendance Methods",
      icon: ScanFace,
    },
    {
      id: "legal",
      label: "Legal & Privacy",
      icon: FileText,
    },
  ]

  const activeItem = menuItems.find((item) => item.id === activeTab) || menuItems[0]
  const ActiveIcon = activeItem.icon

  return (
    <div className="border-border/80 h-fit w-full shrink-0 space-y-6 rounded-2xl bg-white lg:w-64 lg:border lg:p-3 lg:shadow-[0_2px_16px_rgba(24,24,27,0.035)]">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <h2 className="text-foreground px-3 pt-2 pb-3 text-sm font-semibold">Settings</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Link
                key={item.id}
                href={`/admin/settings?tab=${item.id}`}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/8 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-accent" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <ActiveIcon className="text-accent h-5 w-5" />
                <span className="text-foreground font-medium">{activeItem.label}</span>
              </div>
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Settings Menu</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-1 p-4 pt-0">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <Link
                    key={item.id}
                    href={`/admin/settings?tab=${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-accent" : "text-muted-foreground"
                      )}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
