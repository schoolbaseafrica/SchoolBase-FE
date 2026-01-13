import React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"
import { ConfigProvider } from "@/providers/config-provider"
import { Toaster } from "sonner"
import { defaultSchoolProfile } from "@/data/school-profile"
import { BrandThemeUpdater } from "@/components/brand-theme-updater"
import { PageTitleFaviconUpdater } from "@/components/page-title-favicon-updater"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

// Use default for viewport (will be updated by BrandThemeUpdater at runtime)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
  // Note: BrandThemeUpdater component sets CSS variables on <html> element dynamically
  // Removing inline styles from body to avoid conflicts - BrandThemeUpdater handles all theming
  // CSS variables set on <html> will cascade to all child elements

  return (
    <QueryProvider>
      <html lang="en">
        <head>
          <GoogleAnalytics />
        </head>
        <body className={`${outfit.variable} font-outfit antialiased`}>
          <ConfigProvider>
            <BrandThemeUpdater />
            <PageTitleFaviconUpdater />
            <div className="min-h-screen">{children}</div>
            <Toaster position="bottom-right" richColors />
          </ConfigProvider>
        </body>
      </html>
    </QueryProvider>
  )
}
