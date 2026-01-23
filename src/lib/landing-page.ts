/**
 * Landing page config API.
 *
 * Uses fetch to /api/proxy-auth/school/landing-page (same-origin) only.
 * No NEXT_PUBLIC_API_BASE_URL or other hardcoded URLs. The proxy derives
 * the backend from the request host (e.g. stpaul.schoolbase.africa → api.stpaul...),
 * so one Docker image works for all schools in multi-school deployment.
 */

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

const PROXY_PATH = "/api/proxy-auth/school/landing-page"

async function proxyFetch<T>(
  method: "GET" | "PATCH",
  body?: object
): Promise<T> {
  const res = await fetch(PROXY_PATH, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache: "no-store",
  })

  const text = await res.text()
  let data: T & { message?: string }
  try {
    data = (text ? JSON.parse(text) : {}) as T & { message?: string }
  } catch {
    throw new Error(res.ok ? "Invalid response" : text || "Server error. Please try again later.")
  }

  if (!res.ok) {
    const msg =
      (data && typeof (data as { message?: string }).message === "string")
        ? (data as { message: string }).message
        : "Server error. Please try again later."
    throw new Error(msg)
  }

  return data as T
}

export const LandingPageAPI = {
  async getConfig(): Promise<LandingPageConfigResponse> {
    return proxyFetch<LandingPageConfigResponse>("GET")
  },

  async updateConfig(config: LandingPageConfig): Promise<LandingPageConfigResponse> {
    return proxyFetch<LandingPageConfigResponse>("PATCH", {
      landing_page_config: config,
    })
  },
}
