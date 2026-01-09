import { redirect } from "next/navigation"
import { headers } from "next/headers"

// Force dynamic rendering - this page checks installation status at runtime
export const dynamic = "force-dynamic"

/**
 * Root page - Checks installation status and redirects accordingly
 *
 * Flow:
 * 1. Check backend API for school installation status (database is source of truth)
 * 2. If school exists and installation_completed === true → redirect to /landing
 * 3. If school exists but installation_completed === false → redirect to /setup
 * 4. If no school exists (404) → redirect to /setup
 * 5. If backend unavailable → redirect to /setup (assume setup needed)
 *
 * Note: ENV vars (NEXT_PUBLIC_SCHOOL_NAME, etc.) are ONLY used for frontend configuration
 * (branding, theming), NOT for determining installation status. Installation status
 * is ALWAYS determined by the database (installation_completed field).
 */
export default async function RootPage() {
  // Check installation status by calling the school config API
  // This endpoint now returns school even if installation is incomplete
  try {
    // Construct backend URL dynamically from headers (multi-school support)
    const headersList = await headers()
    const hostname = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost"
    const protocol = headersList.get("x-forwarded-proto") || "https"
    
    // Priority 1: Runtime environment variable (without NEXT_PUBLIC_ prefix)
    let baseUrl = process.env.API_BASE_URL
    
    // Priority 2: Construct from request hostname
    if (!baseUrl) {
      if (hostname && hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
        // For multi-school: prepend 'api.' to hostname
        // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
        if (hostname.startsWith("api.")) {
          baseUrl = `${protocol}://${hostname}`
        } else {
          baseUrl = `${protocol}://api.${hostname}`
        }
      } else {
        // Localhost fallback
        baseUrl = `${protocol}://${hostname}:${process.env.BACKEND_PORT || process.env.PORT || 3008}`
      }
    }
    
    // Priority 3: Fallback to baked-in NEXT_PUBLIC_API_BASE_URL (least reliable for multi-school)
    if (!baseUrl) {
      baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3008"
    }
    
    // Normalize: remove trailing slashes and /api/v1 if present
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    const response = await fetch(`${normalizedBaseUrl}/api/v1/school`, {
      method: "GET",
      cache: "no-store", // Always check fresh
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const responseData = await response.json()
      // Backend may wrap in {status_code, message, data} or return directly
      const data = responseData?.data || responseData

      // Debug logging (remove in production)
      console.log("[RootPage] School API response:", {
        rawResponse: responseData,
        extractedData: data,
        installation_completed: data?.installation_completed,
        installation_completed_type: typeof data?.installation_completed,
      })

      // Check installation_completed flag (database is source of truth)
      if (data?.installation_completed === true) {
        // Installation complete - redirect to landing page (public school website)
        redirect("/landing")
      } else {
        // School exists but installation not complete - go to setup
        console.log(
          "[RootPage] Installation not complete, redirecting to setup. installation_completed:",
          data?.installation_completed
        )
        redirect("/setup")
      }
    } else if (response.status === 404 || response.status === 409) {
      // School doesn't exist (404) or conflict (409) - redirect to setup
      // 409 means no school found (backend uses ConflictException for SCHOOL_NOT_FOUND)
      console.log("[RootPage] School not found (status:", response.status, "), redirecting to setup")
      redirect("/setup")
    } else {
      // Other error - assume setup needed
      redirect("/setup")
    }
  } catch (error: any) {
    // Don't log redirect errors - they're expected Next.js behavior
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors so Next.js can handle them
    }
    // Network error or backend not available - assume setup needed
    console.warn("Could not check installation status, redirecting to setup:", error)
    redirect("/setup")
  }
}
