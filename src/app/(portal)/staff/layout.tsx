import type { Metadata } from "next"
import React from "react"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"
import StaffLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Staff Dashboard",
  description: "Staff portal for SchoolBase - manage your profile and access assigned resources.",
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <StaffLayoutClient>{children}</StaffLayoutClient>
      </UserProvider>
    </QueryProvider>
  )
}
