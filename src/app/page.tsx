import { redirect } from "next/navigation"

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
    // Use NEXT_PUBLIC_API_BASE_URL (without /api/v1) or fallback
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008"
    // Normalize: remove trailing slashes and /api/v1 if present
    baseUrl = baseUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    const response = await fetch(`${baseUrl}/api/v1/school`, {
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
      // School doesn't exist - redirect to setup
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
