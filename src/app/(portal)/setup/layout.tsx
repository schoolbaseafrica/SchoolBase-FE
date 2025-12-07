import type { Metadata } from "next"
import { GeneralQueryProvider } from "@/providers/general-query-provider"

export const metadata: Metadata = {
  title: "Super Admin Setup | School Base",
  description:
    "Complete the initial School Base setup to configure your school workspace.",
}

export default function SuperAdminSetuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GeneralQueryProvider>
      <div className="h-screen w-screen overflow-x-hidden bg-white">{children}</div>
    </GeneralQueryProvider>
  )
}
