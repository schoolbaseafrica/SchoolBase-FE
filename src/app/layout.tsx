import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { GeneralQueryProvider } from "@/providers/general-query-provider"
import { Toaster } from "sonner"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const viewport = {
  themeColor: "#0f172a",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://borjigin.emerj.net/"),
  title: {
    default: "School Base",
    template: "%s | School Base",
  },
  description:
    "The modern way schools run in Nigeria. Manage attendance, results, timetables, fees, and NFC all in one place. Connect students, teachers, parents, and administrators.",
  applicationName: "School Base",
  manifest: "/manifest.json",
  keywords: [
    "School Base",
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
    title: "School Base",
  },
  openGraph: {
    title: "School Base",
    description:
      "The modern way schools run in Nigeria. Manage attendance, results, timetables, fees, and NFC all in one place. Connect students, teachers, parents, and administrators.",
    url: "https://borjigin.emerj.net/",
    siteName: "School Base",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icons/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "School Base logo",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
  return (
    <GeneralQueryProvider>
      <html lang="en">
        <body className={`${outfit.variable} font-outfit antialiased`}>
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </GeneralQueryProvider>
  )
}
