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

          // Get default hero images from store (these are the fallbacks)
          const defaultHeroImages = currentSchool.hero.images || []
          
          // Merge custom hero images with defaults by order/index
          // Custom images override defaults for specific slots, but defaults remain for other slots
          const customHeroImages = (config.hero_images || [])
            .filter(img => img?.url && img.url.trim() !== "")
          
          // Create merged hero images array: use custom for slots that have custom, default for others
          const mergedHeroImages = Array.from({ length: 3 }, (_, index) => {
            const customImage = customHeroImages.find(img => img.order === index)
            if (customImage) {
              // Use custom image for this slot
              return {
                src: customImage.url,
                alt: customImage.alt || `Hero image ${index + 1}`,
              }
            }
            // Use default image for this slot (if available)
            return defaultHeroImages[index] || {
              src: `/landing/hero-${index + 1}.jpeg`,
              alt: `Hero image ${index + 1}`,
            }
          })

          // For gallery: merge custom images with defaults (custom images are added, not replacing)
          const defaultGalleryImages = currentSchool.gallery || []
          const customGalleryImages = (config.gallery_images || [])
            .filter(img => img?.url && img.url.trim() !== "")
            .map((img) => ({
              src: img.url,
              alt: img.alt || "Gallery image",
            }))
          
          // Merge: custom images first, then defaults (avoid duplicates)
          const defaultGalleryUrls = new Set(defaultGalleryImages.map(img => img.src))
          const uniqueDefaultGallery = defaultGalleryImages.filter(img => 
            !customGalleryImages.some(custom => custom.src === img.src)
          )
          const mergedGalleryImages = [...customGalleryImages, ...uniqueDefaultGallery]

          // For testimonials: use custom if available, otherwise keep defaults
          const defaultTestimonials = currentSchool.testimonials || []
          const customTestimonials = (config.testimonials || [])
            .filter(t => t?.quote && t.quote.trim() !== "" && t?.name && t.name.trim() !== "")
            .map((t) => ({
              quote: t.quote,
              name: t.name,
              role: t.role,
              avatar: t.avatar,
            }))
          
          // Use custom testimonials if any exist, otherwise keep defaults
          const mergedTestimonials = customTestimonials.length > 0 ? customTestimonials : defaultTestimonials

          // Update store with merged data
          updateSchool({
            hero: {
              ...currentSchool.hero,
              images: mergedHeroImages,
            },
            testimonials: mergedTestimonials,
            gallery: mergedGalleryImages,
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
