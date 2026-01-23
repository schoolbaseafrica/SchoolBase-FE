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
          const currentHero = useSchoolStore.getState().school.hero

          // Update the school store with landing page config
          updateSchool({
            hero: {
              ...currentHero,
              images: (config.hero_images || []).map((img) => ({
                src: img.url,
                alt: img.alt || "Hero image",
              })),
            },
            testimonials: (config.testimonials || []).map((t) => ({
              quote: t.quote,
              name: t.name,
              role: t.role,
              avatar: t.avatar,
            })),
            gallery: (config.gallery_images || []).map((img) => ({
              src: img.url,
              alt: img.alt || "Gallery image",
            })),
          })
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
