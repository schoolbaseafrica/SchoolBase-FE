import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../../_proxy"

export async function POST(req: Request) {
  try {
    // Call your backend (backend uses /api/v1 prefix)
    const backendResponse = await proxyAuthRequest(req, "/api/v1/superadmin/login")

    // Check if response is ok before parsing
    if (!backendResponse.ok) {
      // For error responses, try to parse JSON, but handle errors gracefully
      try {
        const errorData = await backendResponse.json()
        return NextResponse.json(errorData, {
          status: backendResponse.status,
        })
      } catch {
        // If JSON parsing fails, return text response
        const errorText = await backendResponse.text()
        return NextResponse.json(
          { message: errorText || "Server error. Please try again later." },
          {
            status: backendResponse.status,
          }
        )
      }
    }

    const data = await backendResponse.json()

    if (data?.data) {
      const {
        access_token,
        refresh_token,
        session_id,
        session_expires_at,
        id: user_id, // Super admin response has id directly, not nested in user object
      } = data.data
      const expiresAt = new Date(session_expires_at)

      // Create response with original backend data
      const response = NextResponse.json(data, {
        status: 200,
      })

      const SECURE_ONLY = true

      // Clear previous authentication cookies before setting new ones
      // This ensures no conflicts when logging in as a different user
      response.cookies.delete("access_token")
      response.cookies.delete("refresh_token")
      response.cookies.delete("session_id")
      response.cookies.delete("user_id")

      // Set cookies — HTTP-only for security
      response.cookies.set("access_token", access_token, {
        httpOnly: true,
        secure: SECURE_ONLY,
        sameSite: "strict",
        path: "/",
        expires: expiresAt,
      })

      response.cookies.set("refresh_token", refresh_token, {
        httpOnly: true,
        secure: SECURE_ONLY,
        sameSite: "strict",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })

      // Set cookies — HTTP-only for security
      response.cookies.set("session_id", session_id, {
        httpOnly: true,
        secure: SECURE_ONLY,
        sameSite: "strict",
        path: "/",
        maxAge: Infinity,
      })

      response.cookies.set("user_id", user_id, {
        httpOnly: true,
        secure: SECURE_ONLY,
        sameSite: "strict",
        path: "/",
        maxAge: Infinity,
      })

      return response
    }

    // === ERROR ===
    // Return EXACT backend status + body
    return new NextResponse(typeof data === "string" ? data : JSON.stringify(data), {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[superadmin/login] Route handler error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Server error. Please try again later.",
      },
      { status: 500 }
    )
  }
}
