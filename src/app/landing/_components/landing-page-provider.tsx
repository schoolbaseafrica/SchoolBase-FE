"use client"

import { useEffect } from "react"
import { LandingPageAPI, type LandingPageConfig } from "@/lib/landing-page"
import { useSchoolStore } from "@/store/use-school-store"

interface LandingPageProviderProps {
  children: React.ReactNode
}

/**
 * Provider that fetches landing page config and updates the school store
 * This ensures landing page components have access to custom images and testimonials
 */
export function LandingPageProvider({ children }: LandingPageProviderProps) {
  const updateSchool = useSchoolStore((state) => state.updateSchool)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await LandingPageAPI.getConfig()
        const configData = response.data?.landing_page_config || response.data

        if (configData) {
          const config = configData as LandingPageConfig
          const currentSchool = useSchoolStore.getState().school

          // Filter out empty/invalid images before updating store
          const heroImages = (config.hero_images || [])
            .filter(img => img?.url && img.url.trim() !== "")
            .map((img) => ({
              src: img.url,
              alt: img.alt || "Hero image",
            }))

          const galleryImages = (config.gallery_images || [])
            .filter(img => img?.url && img.url.trim() !== "")
            .map((img) => ({
              src: img.url,
              alt: img.alt || "Gallery image",
            }))

          const testimonials = (config.testimonials || [])
            .filter(t => t?.quote && t.quote.trim() !== "" && t?.name && t.name.trim() !== "")
            .map((t) => ({
              quote: t.quote,
              name: t.name,
              role: t.role,
              avatar: t.avatar,
            }))

          // Only update if we have at least some data
          // If all arrays are empty, it likely means user hasn't configured yet, so keep defaults
          // If at least one array has data, use API response (user has configured something)
          const hasAnyData = heroImages.length > 0 || galleryImages.length > 0 || testimonials.length > 0
          
          if (hasAnyData) {
            // User has configured something - use API data (even if some arrays are empty)
            updateSchool({
              hero: {
                ...currentSchool.hero,
                images: heroImages.length > 0 ? heroImages : currentSchool.hero.images,
              },
              testimonials: testimonials.length > 0 ? testimonials : currentSchool.testimonials,
              gallery: galleryImages.length > 0 ? galleryImages : currentSchool.gallery,
            })
          }
          // If hasAnyData is false, don't update - keep defaults (user hasn't configured yet)
        }
      } catch (error) {
        console.error("Failed to fetch landing page config:", error)
        // Silently fail - components will use defaults from store
      }
    }

    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Render children - components will use store (which gets updated by this provider)
  return <>{children}</>
}
