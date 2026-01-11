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

    // Update favicon - use a data attribute to identify our dynamically added favicons
    const FAVICON_ID = "dynamic-favicon"
    const APPLE_ICON_ID = "dynamic-apple-icon"

    // Remove only our dynamically added favicons (identified by data attribute)
    const existingDynamicFavicon = document.querySelector(`link[data-favicon-id="${FAVICON_ID}"]`)
    if (existingDynamicFavicon) {
      try {
        existingDynamicFavicon.remove()
      } catch (e) {
        // Ignore errors if element was already removed
      }
    }

    // Create new favicon link
    const favicon = document.createElement("link")
    favicon.rel = "icon"
    favicon.type = "image/png"
    favicon.setAttribute("data-favicon-id", FAVICON_ID)
    
    // Use favicon URL, fallback to logo URL, fallback to default
    const iconUrl = faviconUrl || logoUrl || "/assets/logo.png"
    favicon.href = iconUrl
    
    // Add cache-busting query parameter for external logos to ensure they refresh
    if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
      try {
        const url = new URL(iconUrl)
        url.searchParams.set("v", Math.floor(Date.now() / 60000).toString())
        favicon.href = url.toString()
      } catch (e) {
        // If URL parsing fails, use original URL
        favicon.href = iconUrl
      }
    }
    
    document.head.appendChild(favicon)

    // Also update Apple touch icon if logo is available
    const existingDynamicAppleIcon = document.querySelector(`link[data-favicon-id="${APPLE_ICON_ID}"]`)
    if (existingDynamicAppleIcon) {
      try {
        existingDynamicAppleIcon.remove()
      } catch (e) {
        // Ignore errors if element was already removed
      }
    }

    if (logoUrl) {
      const appleIcon = document.createElement("link")
      appleIcon.rel = "apple-touch-icon"
      appleIcon.sizes = "180x180"
      appleIcon.type = "image/png"
      appleIcon.setAttribute("data-favicon-id", APPLE_ICON_ID)
      
      let appleIconUrl = logoUrl
      if (appleIconUrl.startsWith("http://") || appleIconUrl.startsWith("https://")) {
        try {
          const url = new URL(appleIconUrl)
          url.searchParams.set("v", Math.floor(Date.now() / 60000).toString())
          appleIconUrl = url.toString()
        } catch (e) {
          // If URL parsing fails, use original URL
          appleIconUrl = logoUrl
        }
      }
      
      appleIcon.href = appleIconUrl
      document.head.appendChild(appleIcon)
    }
  }, [schoolName, schoolShortName, faviconUrl, logoUrl, isConfigLoading])

  return null
}
