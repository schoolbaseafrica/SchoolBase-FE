"use client"

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { Bell, Building2, ChevronDown, FileText, Lock, Trash2, User } from "lucide-react"
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
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "reset-password",
      label: "Reset Password",
      icon: Lock,
    },
    {
      id: "legal",
      label: "Legal & Privacy",
      icon: FileText,
    },
    {
      id: "delete-account",
      label: "Delete Account",
      icon: Trash2,
    },
  ]

  const activeItem = menuItems.find((item) => item.id === activeTab) || menuItems[0]
  const ActiveIcon = activeItem.icon

  return (
    <div className="border-border h-fit w-full shrink-0 space-y-6 rounded-xl bg-white lg:w-64 lg:border lg:p-4">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <h2 className="text-foreground mb-4 text-lg font-bold">Settings</h2>
        <nav className="divide-y">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Link
                key={item.id}
                href={`/admin/settings?tab=${item.id}`}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-accent border-l-accent border-l-2"
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
