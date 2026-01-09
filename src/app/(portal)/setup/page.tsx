import { redirect } from "next/navigation"
import { headers } from "next/headers"
import SchoolSetupWizard from "./_components/setup-wizard"

// Force dynamic rendering - this page checks installation status at runtime
export const dynamic = "force-dynamic"

/**
 * Setup page - Checks if installation is already complete
 * If complete, redirects to super admin login
 */
export default async function SetupPage() {
  // Check if installation is already complete
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
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const responseData = await response.json()
      // Backend may wrap in {status_code, message, data} or return directly
      const data = responseData?.data || responseData
      // If installation is complete, redirect to super admin login
      if (data?.installation_completed === true) {
        redirect("/super-admin/login")
      }
    }
  } catch (error: any) {
    // Don't log redirect errors - they're expected Next.js behavior
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors so Next.js can handle them
    }
    // If check fails (backend not available), allow setup to proceed
    console.warn("Could not verify installation status:", error)
  }

  return <SchoolSetupWizard />
}
