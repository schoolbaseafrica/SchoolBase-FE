import { NextResponse } from "next/server"

/**
 * Public API route to validate parent access links
 * This bypasses the proxy to avoid adding authentication headers
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    // Get backend URL dynamically
    const url = new URL(req.url)
    const hostname =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || url.hostname
    const protocol = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")

    // Construct backend URL
    let backendBaseUrl: string
    if (process.env.API_BASE_URL) {
      backendBaseUrl = process.env.API_BASE_URL.replace(/\/+$/, "").replace(
        /\/api\/v1\/?$/,
        ""
      )
    } else if (
      hostname &&
      hostname !== "localhost" &&
      !hostname.startsWith("127.0.0.1")
    ) {
      const backendHostname = hostname.startsWith("api.") ? hostname : `api.${hostname}`
      backendBaseUrl = `${protocol}://${backendHostname}`
    } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "").replace(
        /\/api\/v1\/?$/,
        ""
      )
    } else {
      backendBaseUrl = `${protocol}://${hostname}:${process.env.BACKEND_PORT || 3008}`
    }

    const backendUrl = `${backendBaseUrl}/api/v1/parent-access-links/validate`

    // Call backend directly without authentication headers
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })

    const responseData = await response.json()

    // Only return fields the browser needs. Session credentials stay in HttpOnly cookies.
    const publicResponseData =
      response.ok && responseData.data
        ? {
            message: responseData.message,
            status_code: responseData.status_code,
            data: {
              user: responseData.data.user,
              requires_password_reset: responseData.data.requires_password_reset,
              reset_token: responseData.data.reset_token,
            },
          }
        : responseData
    const nextResponse = NextResponse.json(publicResponseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok && responseData.data) {
      const { access_token, refresh_token, session_id, session_expires_at } =
        responseData.data

      if (access_token && refresh_token && session_id) {
        const SECURE = process.env.NODE_ENV === "production"
        const expiresAt = new Date(session_expires_at)

        // Set cookies directly in the validate response
        // This ensures they're available immediately, especially for Firefox
        nextResponse.cookies.set("access_token", access_token, {
          httpOnly: true,
          secure: SECURE,
          sameSite: "lax",
          path: "/",
          expires: expiresAt,
        })

        nextResponse.cookies.set("refresh_token", refresh_token, {
          httpOnly: true,
          secure: SECURE,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        nextResponse.cookies.set("session_id", session_id, {
          httpOnly: true,
          secure: SECURE,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        })

        if (responseData.data.user?.id) {
          nextResponse.cookies.set("user_id", responseData.data.user.id, {
            httpOnly: true,
            secure: SECURE,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
          })
        }
      }
    }

    return nextResponse
  } catch (error) {
    console.error("[parent-access-links/validate] Error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to validate access link",
      },
      { status: 500 }
    )
  }
}
