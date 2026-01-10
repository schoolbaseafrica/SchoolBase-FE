import type { RuntimeConfig, RuntimeSchoolConfig } from "@/types/runtime-config"
import type { SchoolProfile, BrandPalette } from "@/data/school-profile"
import { defaultSchoolProfile } from "@/data/school-profile"

/**
 * Helper to access process.env - matches pattern used in codebase
 * Next.js inlines NEXT_PUBLIC_* env vars at build time
 */
function getEnv(key: string): string | undefined {
  // Access using optional chaining like the direct check that works
  // process.env is replaced by Next.js at build time
  return typeof process !== "undefined"
    ? (process as { env?: Record<string, string | undefined> }).env?.[key]
    : undefined
}

/**
 * Loads configuration from environment variables
 * Returns null if no env vars are set (will fallback to defaults)
 */
export function loadConfigFromEnv(): RuntimeConfig | null {
  // Check if we're in browser (client-side)
  if (typeof window === "undefined") {
    // Server-side: can't access window, return null to use API fallback
    return null
  }

  // Access directly using the pattern that works (from directCheck)
  // process.env is replaced by Next.js at build time
  const schoolName =
    typeof process !== "undefined"
      ? (process as { env?: Record<string, string | undefined> }).env
          ?.NEXT_PUBLIC_SCHOOL_NAME
      : undefined
  // process.env is replaced by Next.js at build time
  const primaryColor =
    typeof process !== "undefined"
      ? (process as { env?: Record<string, string | undefined> }).env
          ?.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR
      : undefined

  // Debug: Log what we found
  if (typeof window !== "undefined") {
    console.log("[Config] Checking env vars:", {
      schoolName,
      primaryColor,
      hasWindow: typeof window !== "undefined",
    })
  }

  if (!schoolName) {
    // No env config available
    console.log("[Config] No NEXT_PUBLIC_SCHOOL_NAME found, will use defaults")
    return null
  }

  // Access all env vars directly using the working pattern (same as schoolName above)
  // Next.js inlines NEXT_PUBLIC_* at build time
  const env =
    typeof process !== "undefined"
      ? (process as { env?: Record<string, string | undefined> }).env
      : undefined

  const config = {
    school: {
      name: schoolName,
      shortName: env?.NEXT_PUBLIC_SCHOOL_SHORT_NAME,
      logoUrl: env?.NEXT_PUBLIC_SCHOOL_LOGO_URL,
      logoMark: env?.NEXT_PUBLIC_SCHOOL_LOGO_MARK,
      faviconUrl: env?.NEXT_PUBLIC_SCHOOL_FAVICON_URL,
      primaryColor: primaryColor, // Use the one we already read above (same pattern as schoolName)
      primaryHover: env?.NEXT_PUBLIC_SCHOOL_PRIMARY_HOVER,
      secondaryColor: env?.NEXT_PUBLIC_SCHOOL_SECONDARY_COLOR,
      accentColor: env?.NEXT_PUBLIC_SCHOOL_ACCENT_COLOR,
      supportEmail: env?.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL,
      supportPhone: env?.NEXT_PUBLIC_SCHOOL_SUPPORT_PHONE,
      description: env?.NEXT_PUBLIC_SCHOOL_DESCRIPTION,
      tagline: env?.NEXT_PUBLIC_SCHOOL_TAGLINE,
    },
    apiUrl:
      env?.NEXT_PUBLIC_API_BASE_URL ||
      (env?.NEXT_PUBLIC_API_URL
        ? env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
        : undefined),
    environment:
      (env?.NODE_ENV as "development" | "staging" | "production") || "development",
  }

  console.log("[Config] Loaded from env vars:", config)

  return config
}

/**
 * Builds a complete SchoolProfile from runtime config
 * Only uses values from runtime config, no defaults merged
 * Returns null if runtimeConfig is null/empty (should use defaults instead)
 */
export function buildSchoolProfileFromRuntimeConfig(
  runtimeConfig: RuntimeSchoolConfig | null
): SchoolProfile | null {
  // Return null if no config provided or required fields missing - caller should use defaults
  // Required: name and primaryColor must be present and non-empty
  if (
    !runtimeConfig ||
    !runtimeConfig.name ||
    !runtimeConfig.primaryColor ||
    runtimeConfig.primaryColor.trim() === ""
  ) {
    return null
  }

  // Merge with default profile to preserve default images, gallery, testimonials, etc.
  // Backend API only returns basic school info (name, logo, colors), so we keep defaults for rest

  // Derive shortName from name if not provided
  const shortName =
    runtimeConfig.shortName ||
    runtimeConfig.name.split(" ").slice(0, 2).join(" ") ||
    runtimeConfig.name.substring(0, 12)

  // Build brand palette from runtime config only (no fallbacks, already validated above)
  const primaryColor = runtimeConfig.primaryColor
  const primaryHover = runtimeConfig.primaryHover || darkenColor(primaryColor, 0.1)
  const tintColor = runtimeConfig.accentColor
    ? lightenColor(runtimeConfig.accentColor, 0.9)
    : lightenColor(primaryColor, 0.9)

  const brandPalette: BrandPalette = {
    primary: primaryColor,
    primaryHover: primaryHover,
    tint: tintColor,
    onPrimary: "#ffffff", // Standard white for text on primary
    text: "#1f2024", // Standard dark text
    mutedText: "#4a4a4a", // Standard muted text
    surface: "#ffffff", // Standard white surface
  }

  // Merge runtime config with default profile
  // This preserves default images, gallery, testimonials, programs, etc.
  // while overriding with backend-provided values where available
  // IMPORTANT: Images and gallery are ALWAYS preserved from defaults - schools cannot change these
  return {
    ...defaultSchoolProfile, // Start with all defaults (images, gallery, testimonials, etc.)
    name: runtimeConfig.name,
    shortName: shortName,
    tagline: runtimeConfig.tagline || `${runtimeConfig.name} - Excellence in Education`,
    description:
      runtimeConfig.description || `${runtimeConfig.name} provides quality education.`,
    logo: {
      full: runtimeConfig.logoUrl || defaultSchoolProfile.logo.full,
      mark: runtimeConfig.logoMark || runtimeConfig.logoUrl || defaultSchoolProfile.logo.mark,
      favicon: runtimeConfig.faviconUrl || runtimeConfig.logoUrl || defaultSchoolProfile.logo.favicon,
    },
    brand: brandPalette,
    hero: {
      ...defaultSchoolProfile.hero, // Preserve default hero images, ctaLabel, ctaHref
      heading: `Welcome to ${runtimeConfig.name}`,
      body:
        runtimeConfig.description || `${runtimeConfig.name} provides quality education.`,
      // ALWAYS preserve images array from defaults (backend doesn't provide these, and schools cannot customize)
      images: [...defaultSchoolProfile.hero.images],
    },
    // ALWAYS preserve gallery from defaults (schools cannot customize gallery images)
    gallery: [...defaultSchoolProfile.gallery],
    contact: {
      ...defaultSchoolProfile.contact,
      email: runtimeConfig.supportEmail || defaultSchoolProfile.contact.email,
      phone: runtimeConfig.supportPhone || defaultSchoolProfile.contact.phone,
    },
  }
}

/**
 * Helper: Darken a hex color by a factor (0-1)
 */
function darkenColor(hex: string, factor: number): string {
  const color = hex.replace("#", "")
  const num = parseInt(color, 16)
  const r = Math.max(0, Math.round((num >> 16) * (1 - factor)))
  const g = Math.max(0, Math.round(((num >> 8) & 0x00ff) * (1 - factor)))
  const b = Math.max(0, Math.round((num & 0x0000ff) * (1 - factor)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

/**
 * Fetches configuration from backend API
 * Primary: Backend /api/v1/school endpoint (single source of truth from database)
 * Fallback: Next.js /api/config route (env vars)
 * Silently fails if backend is not available (graceful degradation)
 */
export async function loadConfigFromAPI(apiUrl?: string): Promise<RuntimeConfig | null> {
  // Only fetch on client-side (browser)
  if (typeof window === "undefined") {
    return null
  }

  try {
    // Use a timeout with AbortController for better browser compatibility
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      // Strategy 1: Use Next.js proxy route to backend API (single source of truth from database)
      // This works regardless of NEXT_PUBLIC_API_BASE_URL being set
      // The proxy route /api/proxy-auth/school proxies to backend /api/v1/school
      const backendResponse = await fetch("/api/proxy-auth/school", {
        cache: "no-store", // Always fetch fresh config
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      if (backendResponse.ok) {
        clearTimeout(timeoutId)

        // Backend wraps response in {status_code, message, data}
        const backendResponseWrapper = await backendResponse.json()
        const backendData = backendResponseWrapper.data || backendResponseWrapper

        // Derive shortName from name (first 2 words)
        const shortName = backendData.name
          ? backendData.name.split(" ").slice(0, 2).join(" ") ||
            backendData.name.substring(0, 12)
          : undefined

        // Transform backend response to frontend RuntimeConfig format
        // For logo URL, convert relative paths to absolute URLs
        // Logos are served by the backend, so we need the backend domain
        let logoUrl = backendData.logo_url
        if (logoUrl && !logoUrl.startsWith("http")) {
          // Try to get API base URL from env first
          const envApiUrl = getEnv("NEXT_PUBLIC_API_BASE_URL")
          if (envApiUrl) {
            const baseUrl = envApiUrl.replace(/\/+$/, "")
            logoUrl = `${baseUrl}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`
          } else if (typeof window !== "undefined") {
            // Fallback: construct backend URL from current origin
            // If frontend is at dev.learningspaces.im, backend is at api.learningspaces.im
            const currentOrigin = window.location.origin
            const protocol = window.location.protocol
            const hostname = window.location.hostname
            
            // Extract base domain (e.g., "learningspaces.im" from "dev.learningspaces.im")
            const parts = hostname.split(".")
            let backendHostname: string
            
            if (parts.length >= 2) {
              // Replace first subdomain with 'api' (e.g., dev.learningspaces.im -> api.learningspaces.im)
              parts[0] = "api"
              backendHostname = parts.join(".")
            } else {
              // Single domain (localhost) - use as-is
              backendHostname = hostname
            }
            
            const backendOrigin = `${protocol}//${backendHostname}`
            logoUrl = `${backendOrigin}${logoUrl.startsWith("/") ? "" : ""}${logoUrl}`
          }
        }

        const config: RuntimeConfig = {
          school: {
            name: backendData.name,
            shortName: shortName,
            logoUrl: logoUrl,
            primaryColor: backendData.primary_color,
            secondaryColor: backendData.secondary_color,
            accentColor: backendData.accent_color,
            supportEmail: backendData.email,
            supportPhone: backendData.phone,
          },
          apiUrl: apiUrl || getEnv("NEXT_PUBLIC_API_BASE_URL"),
          environment:
            (getEnv("NODE_ENV") as "development" | "staging" | "production") ||
            "development",
        }

        console.log(
          "[Config] Loaded from backend API (via proxy):",
          config.school.name,
          config.school.primaryColor
        )
        return config
      }

      // Strategy 2: Fallback to Next.js API route (env vars)
      console.log("[Config] Backend API not available, trying Next.js API route...")
      const apiRouteResponse = await fetch("/api/config", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (apiRouteResponse.ok) {
        const data: RuntimeConfig = await apiRouteResponse.json()
        console.log("[Config] Loaded from Next.js API route:", data.school.name)
        return data
      }

      // Both failed - will use defaults
      return null
    } catch {
      clearTimeout(timeoutId)
      // Network errors are expected (backend not available, etc.)
      // Silently fail - will use defaults
      return null
    }
  } catch {
    // Silently fail - backend not available is expected in some scenarios
    // Will use defaults instead
    return null
  }
}

/**
 * Helper: Lighten a hex color by a factor (0-1)
 * Used to generate tint color from primary color
 */
function lightenColor(hex: string, factor: number): string {
  // Remove # if present
  const color = hex.replace("#", "")
  const num = parseInt(color, 16)
  const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * factor))
  const g = Math.min(
    255,
    Math.round(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * factor)
  )
  const b = Math.min(
    255,
    Math.round((num & 0x0000ff) + (255 - (num & 0x0000ff)) * factor)
  )
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}
