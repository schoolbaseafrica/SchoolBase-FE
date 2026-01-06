import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../../_proxy"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    // 1. Get cookies
    const cookieStore = await cookies()
    const session_id = cookieStore.get("session_id")?.value
    const user_id = cookieStore.get("user_id")?.value

    // 2. Build request body for super admin logout
    // Note: Backend expects UUIDs, but we'll send empty strings if not available
    // The backend will handle gracefully
    const body = {
      session_id: session_id || "",
      user_id: user_id || "",
    }

    // 3. Forward request to super admin logout endpoint
    const backendResponse = await proxyAuthRequest(
      new Request(req, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      "/api/v1/superadmin/logout"
    )

    // Check if response is ok before parsing
    if (!backendResponse.ok) {
      try {
        const errorData = await backendResponse.json()
        return NextResponse.json(errorData, {
          status: backendResponse.status,
        })
      } catch {
        const errorText = await backendResponse.text()
        return NextResponse.json(
          { message: errorText || "Logout failed. Please try again." },
          {
            status: backendResponse.status,
          }
        )
      }
    }

    const data = await backendResponse.json().catch(() => ({}))

    // Create response
    const response = NextResponse.json(
      data || { message: "Logged out successfully" },
      {
        status: 200,
      }
    )

    // Clear all cookies
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")
    response.cookies.delete("session_id")
    response.cookies.delete("user_id")

    return response
  } catch (error) {
    console.error("[superadmin/logout] Route handler error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Server error. Please try again later.",
      },
      { status: 500 }
    )
  }
}

