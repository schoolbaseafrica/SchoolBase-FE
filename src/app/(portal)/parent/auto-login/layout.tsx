import type { Metadata } from "next"
import { buildSchoolProfileFromRuntimeConfig } from "@/lib/config-loader"
import { defaultSchoolProfile } from "@/data/school-profile"

async function getSchoolConfig() {
  // Try to load from environment variables first (fast, server-side)
  const schoolName = process.env.SCHOOL_NAME || process.env.NEXT_PUBLIC_SCHOOL_NAME
  
  if (schoolName) {
    const runtimeConfig = {
      name: schoolName,
      shortName: process.env.SCHOOL_SHORT_NAME || process.env.NEXT_PUBLIC_SCHOOL_SHORT_NAME || schoolName.split(" ").slice(0, 2).join(" "),
      logoUrl: process.env.SCHOOL_LOGO_URL || process.env.NEXT_PUBLIC_SCHOOL_LOGO_URL || defaultSchoolProfile.logo.full,
      primaryColor: process.env.SCHOOL_PRIMARY_COLOR || process.env.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR,
      secondaryColor: process.env.SCHOOL_SECONDARY_COLOR || process.env.NEXT_PUBLIC_SCHOOL_SECONDARY_COLOR,
      accentColor: process.env.SCHOOL_ACCENT_COLOR || process.env.NEXT_PUBLIC_SCHOOL_ACCENT_COLOR,
      supportEmail: process.env.SCHOOL_SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL,
      supportPhone: process.env.SCHOOL_SUPPORT_PHONE || process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_PHONE,
      supportAddress: process.env.SCHOOL_SUPPORT_ADDRESS || process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_ADDRESS,
      description: process.env.SCHOOL_DESCRIPTION || process.env.NEXT_PUBLIC_SCHOOL_DESCRIPTION,
      tagline: process.env.SCHOOL_TAGLINE || process.env.NEXT_PUBLIC_SCHOOL_TAGLINE,
    }
    
    const profile = buildSchoolProfileFromRuntimeConfig({ school: runtimeConfig } as any)
    if (profile) {
      return profile
    }
  }
  
  // Fallback: Try to fetch from backend API
  try {
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    if (apiBaseUrl) {
      const apiUrl = `${apiBaseUrl.replace(/\/+$/, "")}/api/v1/school`
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const schoolData = data.data || data
        
        if (schoolData?.name) {
          const shortName = schoolData.name.split(" ").slice(0, 2).join(" ") || schoolData.name.substring(0, 12)
          const logoUrl = schoolData.logo_url || schoolData.logoUrl || defaultSchoolProfile.logo.full
          
          const runtimeConfig = {
            name: schoolData.name,
            shortName: shortName,
            logoUrl: logoUrl,
            primaryColor: schoolData.primary_color || schoolData.primaryColor,
            secondaryColor: schoolData.secondary_color || schoolData.secondaryColor,
            accentColor: schoolData.accent_color || schoolData.accentColor,
            supportEmail: schoolData.email || schoolData.supportEmail,
            supportPhone: schoolData.phone || schoolData.supportPhone,
            supportAddress: schoolData.address || schoolData.supportAddress,
            description: schoolData.description,
            tagline: schoolData.tagline,
          }
          
          const profile = buildSchoolProfileFromRuntimeConfig({ school: runtimeConfig } as any)
          if (profile) {
            return profile
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading school config for metadata:", error)
  }
  
  return defaultSchoolProfile
}

export async function generateMetadata(): Promise<Metadata> {
  const schoolProfile = await getSchoolConfig()
  
  const title = `${schoolProfile.shortName} - Parent Access`
  const description = schoolProfile.description || `${schoolProfile.name} - Access your child's academic information and updates.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: schoolProfile.name,
      type: "website",
      images: [
        {
          url: schoolProfile.logo.full,
          width: 400,
          height: 400,
          alt: `${schoolProfile.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [schoolProfile.logo.full],
    },
    icons: {
      icon: [
        { url: schoolProfile.logo.favicon, type: "image/png" },
        { url: schoolProfile.logo.mark, type: "image/svg+xml" },
      ],
      apple: [{ url: schoolProfile.logo.full, sizes: "180x180", type: "image/png" }],
    },
  }
}

export default function AutoLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
