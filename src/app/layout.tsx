import React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { Toaster } from "sonner"
import { defaultSchoolProfile } from "@/data/school-profile"
import { BrandThemeUpdater } from "@/components/brand-theme-updater"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const viewport = {
  themeColor: defaultSchoolProfile.brand.primary,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://borjigin.emerj.net/"),
  title: {
    default: defaultSchoolProfile.name,
    template: `%s | ${defaultSchoolProfile.name}`,
  },
  description: defaultSchoolProfile.description,
  applicationName: defaultSchoolProfile.shortName,
  manifest: "/manifest.json",
  keywords: [
    defaultSchoolProfile.name,
    "school portal",
    "education management",
    "attendance",
    "results",
    "timetable",
    "fees",
    "NFC",
    "Nigeria schools",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: defaultSchoolProfile.name,
  },
  openGraph: {
    title: defaultSchoolProfile.name,
    description: defaultSchoolProfile.description,
    url: "https://borjigin.emerj.net/",
    siteName: defaultSchoolProfile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: defaultSchoolProfile.logo.full,
        width: 400,
        height: 400,
        alt: `${defaultSchoolProfile.name} logo`,
      },
    ],
  },
  icons: {
    icon: [
      { url: defaultSchoolProfile.logo.favicon, type: "image/png" },
      { url: defaultSchoolProfile.logo.mark, type: "image/svg+xml" },
    ],
    apple: [{ url: defaultSchoolProfile.logo.full, sizes: "180x180", type: "image/png" }],
  },
  category: "education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const brandVars: React.CSSProperties = {
    ["--accent" as string]: defaultSchoolProfile.brand.primary,
    ["--accent-foreground" as string]: defaultSchoolProfile.brand.onPrimary,
    ["--primary" as string]: defaultSchoolProfile.brand.primary,
    ["--primary-hover" as string]: defaultSchoolProfile.brand.primaryHover,
    ["--text-primary" as string]: defaultSchoolProfile.brand.text,
    ["--text-secondary" as string]: defaultSchoolProfile.brand.mutedText,
    ["--tint" as string]: defaultSchoolProfile.brand.tint,
    ["--sidebar" as string]: defaultSchoolProfile.brand.surface,
    ["--sidebar-foreground" as string]: defaultSchoolProfile.brand.text,
    ["--sidebar-primary" as string]: defaultSchoolProfile.brand.primary,
    ["--sidebar-primary-foreground" as string]: defaultSchoolProfile.brand.onPrimary,
    ["--sidebar-accent" as string]: defaultSchoolProfile.brand.tint,
    ["--sidebar-accent-foreground" as string]: defaultSchoolProfile.brand.primary,
  }

  return (
    <GeneralQueryProvider>
      <html lang="en">
        <body className={`${outfit.variable} font-outfit antialiased`} style={brandVars}>
          <BrandThemeUpdater />
          <div className="min-h-screen">{children}</div>
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </GeneralQueryProvider>
  )
}
