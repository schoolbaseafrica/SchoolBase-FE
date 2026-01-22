import { apiFetch } from "./api/client"

export interface HeroImage {
  id: string
  url: string
  alt: string
  order: number
}

export interface GalleryImage {
  id: string
  url: string
  alt: string
  order: number
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
  avatar: string
  order: number
}

export interface LandingPageConfig {
  hero_images: HeroImage[]
  gallery_images: GalleryImage[]
  testimonials: Testimonial[]
}

interface LandingPageConfigResponse {
  status_code: number
  message: string
  data: {
    landing_page_config: LandingPageConfig
  }
}

export const LandingPageAPI = {
  /**
   * Get the current landing page configuration
   */
  async getConfig(): Promise<LandingPageConfigResponse> {
    return apiFetch<LandingPageConfigResponse>("/school/landing-page", {
      method: "GET",
    })
  },

  /**
   * Update the landing page configuration
   */
  async updateConfig(config: LandingPageConfig): Promise<LandingPageConfigResponse> {
    return apiFetch<LandingPageConfigResponse>(
      "/school/landing-page",
      {
        method: "PATCH",
        data: {
          landing_page_config: config,
        },
      },
      true
    )
  },
}
