import type { Metadata } from "next"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import Image from "next/image"

export const viewport = {
  themeColor: "#0f172a",
}

export const metadata: Metadata = {
  title: "Authentication | School Base",
  description:
    "Sign in or create your School Base account to manage your school experience.",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <GeneralQueryProvider>
      <main className="h-screen w-full overflow-hidden lg:grid lg:grid-cols-2">
        <div className="relative hidden h-full w-full lg:top-0 lg:flex">
          <Image
            src={"/assets/images/auth/sign-up-image.png"}
            alt="A science teacher guiding a group of students in maroon school uniforms as they examine samples using a microscope and test tubes in a well-lit laboratory."
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="scrollbar-hide flex h-full w-full overflow-y-auto px-4 sm:px-8 lg:items-center lg:justify-center lg:px-16">
          <div className="w-full lg:max-w-[556px]">{children}</div>
        </div>
      </main>
    </GeneralQueryProvider>
  )
}
