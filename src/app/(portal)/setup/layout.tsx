import type { Metadata } from "next"
import { QueryProvider } from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "Super Admin Setup",
  description:
    "Complete the initial School Base setup to configure your school workspace.",
}

export default function SuperAdminSetuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className="h-screen w-screen overflow-x-hidden bg-white">{children}</div>
    </QueryProvider>
  )
}
