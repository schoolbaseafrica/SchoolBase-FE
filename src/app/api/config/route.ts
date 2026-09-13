import { NextResponse } from "next/server"

/**
 * API route that serves school configuration
 * This is a fallback when environment variables aren't set
 * In production, prefer using environment variables for performance
 *
 * This endpoint reads from server-side environment variables
 * (not NEXT_PUBLIC_* since those are already available client-side)
 */
export async function GET() {
  try {
    // Read from environment variables (set at container startup)
    // These can be SCHOOL_* or NEXT_PUBLIC_SCHOOL_* (both work server-side)
    const config = {
      school: {
        name: process.env.SCHOOL_NAME || process.env.NEXT_PUBLIC_SCHOOL_NAME,
        shortName:
          process.env.SCHOOL_SHORT_NAME || process.env.NEXT_PUBLIC_SCHOOL_SHORT_NAME,
        logoUrl: process.env.SCHOOL_LOGO_URL || process.env.NEXT_PUBLIC_SCHOOL_LOGO_URL,
        logoMark:
          process.env.SCHOOL_LOGO_MARK || process.env.NEXT_PUBLIC_SCHOOL_LOGO_MARK,
        faviconUrl:
          process.env.SCHOOL_FAVICON_URL || process.env.NEXT_PUBLIC_SCHOOL_FAVICON_URL,
        primaryColor:
          process.env.SCHOOL_PRIMARY_COLOR ||
          process.env.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR,
        primaryHover:
          process.env.SCHOOL_PRIMARY_HOVER ||
          process.env.NEXT_PUBLIC_SCHOOL_PRIMARY_HOVER,
        secondaryColor:
          process.env.SCHOOL_SECONDARY_COLOR ||
          process.env.NEXT_PUBLIC_SCHOOL_SECONDARY_COLOR,
        accentColor:
          process.env.SCHOOL_ACCENT_COLOR || process.env.NEXT_PUBLIC_SCHOOL_ACCENT_COLOR,
        supportEmail:
          process.env.SCHOOL_SUPPORT_EMAIL ||
          process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL,
        supportPhone:
          process.env.SCHOOL_SUPPORT_PHONE ||
          process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_PHONE,
        description:
          process.env.SCHOOL_DESCRIPTION || process.env.NEXT_PUBLIC_SCHOOL_DESCRIPTION,
        tagline: process.env.SCHOOL_TAGLINE || process.env.NEXT_PUBLIC_SCHOOL_TAGLINE,
      },
      apiUrl:
        process.env.API_PUBLIC_URL ||
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL,
      environment: process.env.NODE_ENV || "development",
    }

    // Remove undefined values
    const cleanedConfig = {
      school: Object.fromEntries(
        Object.entries(config.school).filter(([_, value]) => value !== undefined)
      ),
      apiUrl: config.apiUrl,
      environment: config.environment,
    }

    return NextResponse.json(cleanedConfig, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error in /api/config route:", error)
    // Return empty config on error (will use defaults on client)
    return NextResponse.json(
      {
        school: {},
        apiUrl: undefined,
        environment: process.env.NODE_ENV || "development",
      },
      { status: 200 } // Return 200 so client can handle gracefully
    )
  }
}
