import type { RuntimeConfig, RuntimeSchoolConfig } from "@/types/runtime-config"
import type { SchoolProfile, BrandPalette } from "@/data/school-profile"

/**
 * Helper to access process.env - matches pattern used in codebase
 * Next.js inlines NEXT_PUBLIC_* env vars at build time
 */
function getEnv(key: string): string | undefined {
  // Access using optional chaining like the direct check that works
  // @ts-ignore - process.env is replaced by Next.js at build time
  return typeof process !== "undefined" ? (process as any).env?.[key] : undefined
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
  // @ts-ignore
  const schoolName =
    typeof process !== "undefined"
      ? (process as any).env?.NEXT_PUBLIC_SCHOOL_NAME
      : undefined
  // @ts-ignore
  const primaryColor =
    typeof process !== "undefined"
      ? (process as any).env?.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR
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
  // @ts-ignore - Next.js inlines NEXT_PUBLIC_* at build time
  const env = typeof process !== "undefined" ? (process as any).env : undefined

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
    apiUrl: env?.NEXT_PUBLIC_API_BASE_URL || env?.NEXT_PUBLIC_API_URL,
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

  // Build minimal SchoolProfile using only runtime config values
  // Required fields that aren't in runtime config get minimal/empty values
  return {
    name: runtimeConfig.name,
    shortName: shortName,
    tagline: runtimeConfig.tagline || `${runtimeConfig.name} - Excellence in Education`,
    description:
      runtimeConfig.description || `${runtimeConfig.name} provides quality education.`,
    logo: {
      full: runtimeConfig.logoUrl || "/assets/logo.png",
      mark: runtimeConfig.logoMark || runtimeConfig.logoUrl || "/assets/logo.svg",
      favicon: runtimeConfig.faviconUrl || runtimeConfig.logoUrl || "/assets/logo.png",
    },
    brand: brandPalette,
    navLinks: [], // Empty - not provided by runtime config
    hero: {
      heading: `Welcome to ${runtimeConfig.name}`,
      body:
        runtimeConfig.description || `${runtimeConfig.name} provides quality education.`,
      ctaLabel: "Get In Touch",
      ctaHref: "#contact",
      images: [], // Empty - not provided by runtime config
    },
    programs: [], // Empty - not provided by runtime config
    testimonials: [], // Empty - not provided by runtime config
    gallery: [], // Empty - not provided by runtime config
    cta: {
      heading: "Ready to get started?",
      body: "Contact us today to learn more.",
      ctaLabel: "Contact Us",
      ctaHref: "#contact",
    },
    contact: {
      office: "",
      email: runtimeConfig.supportEmail || "",
      phone: runtimeConfig.supportPhone || "",
      address: "",
    },
    socials: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
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
    // Debug: Log what we're getting for API URL
    const envApiUrl = getEnv("NEXT_PUBLIC_API_BASE_URL")
    if (typeof window !== "undefined") {
      console.log("[Config] API Base URL from env:", envApiUrl)
    }
    const baseUrl = apiUrl || envApiUrl || "http://localhost:3008"

    // Use a timeout with AbortController for better browser compatibility
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      // Strategy 1: Try backend API first (single source of truth from database)
      // Backend endpoint: /api/v1/school (returns snake_case fields)
      const backendResponse = await fetch(`${baseUrl}/api/v1/school`, {
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
        // Convert relative logo URL to absolute URL if needed
        let logoUrl = backendData.logo_url
        if (logoUrl && !logoUrl.startsWith("http")) {
          // Prepend backend base URL for relative paths
          logoUrl = `${baseUrl}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`
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
          apiUrl: baseUrl,
          environment:
            (getEnv("NODE_ENV") as "development" | "staging" | "production") ||
            "development",
        }

        console.log(
          "[Config] Loaded from backend API:",
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
    } catch (fetchError) {
      clearTimeout(timeoutId)
      // Network errors are expected (backend not available, etc.)
      // Silently fail - will use defaults
      return null
    }
  } catch (error) {
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
