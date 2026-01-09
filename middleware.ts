// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip check for setup, login, and API routes
  if (
    pathname.startsWith("/setup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/super-admin/login") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Check if school exists before allowing access to any protected route
  try {
    // Construct backend URL dynamically from request hostname (multi-school support)
    // Priority 1: Runtime environment variable (without NEXT_PUBLIC_ prefix)
    let baseUrl = process.env.API_BASE_URL
    
    // Priority 2: Construct from request hostname
    if (!baseUrl) {
      const hostname = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.hostname
      const protocol = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "")
      
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
    
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    const schoolResponse = await fetch(`${normalizedBaseUrl}/api/v1/school`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // If school doesn't exist (404 or 409), redirect to setup
    if (schoolResponse.status === 404 || schoolResponse.status === 409) {
      return NextResponse.redirect(new URL("/setup", req.url))
    }

    // If school exists but installation not complete, redirect to setup
    if (schoolResponse.ok) {
      const responseData = await schoolResponse.json()
      const data = responseData?.data || responseData
      if (data?.installation_completed !== true) {
        return NextResponse.redirect(new URL("/setup", req.url))
      }
    }
  } catch (error) {
    // If we can't check school status, assume setup needed
    console.warn("[Middleware] Could not check school status, redirecting to setup:", error)
    return NextResponse.redirect(new URL("/setup", req.url))
  }

  // Routes that need authentication
  const protectedPaths = ["/admin", "/students", "/teachers"]

  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path))
  if (!requiresAuth) return NextResponse.next()

  const accessToken = req.cookies.get("access_token")?.value
  if (!accessToken) {
    // Redirect to login
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/super-admin/:path*",
    "/landing",
    "/dashboard",
  ],
}
