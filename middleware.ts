// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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
  matcher: ["/admin/:path*", "/students/:path*", "/teachers/:path*"],
}
