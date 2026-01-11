"use client"

import { useEffect } from "react"
import { useSchoolStore } from "@/store/use-school-store"

/**
 * Updates the page title and favicon dynamically based on school configuration
 * This runs client-side after the school config is loaded from the API/store
 */
export function PageTitleFaviconUpdater() {
  const schoolName = useSchoolStore((state) => state.school.name)
  const schoolShortName = useSchoolStore((state) => state.school.shortName)
  const faviconUrl = useSchoolStore((state) => state.school.logo.favicon)
  const logoUrl = useSchoolStore((state) => state.school.logo.full)
  const isConfigLoading = useSchoolStore((state) => state.isConfigLoading)

  useEffect(() => {
    // Don't update until config has finished loading
    if (isConfigLoading) {
      return
    }

    // Update page title
    if (schoolName) {
      document.title = schoolName
    }

    // Update favicon
    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
    existingFavicons.forEach((link) => link.remove())

    // Create new favicon link
    const favicon = document.createElement("link")
    favicon.rel = "icon"
    favicon.type = "image/png"
    
    // Use favicon URL, fallback to logo URL, fallback to default
    const iconUrl = faviconUrl || logoUrl || "/assets/logo.png"
    favicon.href = iconUrl
    
    // Add cache-busting query parameter for external logos to ensure they refresh
    if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
      const url = new URL(iconUrl)
      url.searchParams.set("v", Math.floor(Date.now() / 60000).toString())
      favicon.href = url.toString()
    }
    
    document.head.appendChild(favicon)

    // Also update Apple touch icon if logo is available
    const existingAppleIcons = document.querySelectorAll('link[rel="apple-touch-icon"]')
    existingAppleIcons.forEach((link) => link.remove())

    if (logoUrl) {
      const appleIcon = document.createElement("link")
      appleIcon.rel = "apple-touch-icon"
      appleIcon.sizes = "180x180"
      appleIcon.type = "image/png"
      
      let appleIconUrl = logoUrl
      if (appleIconUrl.startsWith("http://") || appleIconUrl.startsWith("https://")) {
        const url = new URL(appleIconUrl)
        url.searchParams.set("v", Math.floor(Date.now() / 60000).toString())
        appleIconUrl = url.toString()
      }
      
      appleIcon.href = appleIconUrl
      document.head.appendChild(appleIcon)
    }
  }, [schoolName, schoolShortName, faviconUrl, logoUrl, isConfigLoading])

  return null
}
