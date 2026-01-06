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
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3008"
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
