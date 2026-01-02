import { redirect } from "next/navigation"
import SchoolSetupWizard from "./_components/setup-wizard"

// Force dynamic rendering - this page checks installation status at runtime
export const dynamic = "force-dynamic"

/**
 * Setup page - Checks if installation is already complete
 * If complete, redirects to landing page
 */
export default async function SetupPage() {
  // Check if installation is already complete
  try {
    // Use NEXT_PUBLIC_API_BASE_URL (without /api/v1) or fallback
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008"
    // Normalize: remove trailing slashes and /api/v1 if present
    baseUrl = baseUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    const response = await fetch(`${baseUrl}/api/v1/school`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      // If installation is complete, redirect to landing page
      if (data?.installation_completed) {
        redirect("/landing")
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
