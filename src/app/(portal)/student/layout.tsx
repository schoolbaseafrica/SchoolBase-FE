import type { Metadata } from "next"
import { QueryProvider } from "@/providers/query-provider"
import { UserProvider } from "@/providers/user-provider"
import StudentLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "View classes, attendance, results, and updates from your school in one place.",
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <StudentLayoutClient>{children}</StudentLayoutClient>
      </UserProvider>
    </QueryProvider>
  )
}
