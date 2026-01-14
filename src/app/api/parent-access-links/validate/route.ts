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
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      )
    }

    // Get backend URL dynamically
    const url = new URL(req.url)
    const hostname = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.hostname
    const protocol = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
    
    // Construct backend URL
    let backendBaseUrl: string
    if (process.env.API_BASE_URL) {
      backendBaseUrl = process.env.API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    } else if (hostname && hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
      const backendHostname = hostname.startsWith("api.") ? hostname : `api.${hostname}`
      backendBaseUrl = `${protocol}://${backendHostname}`
    } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
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

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[parent-access-links/validate] Error:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to validate access link",
      },
      { status: 500 }
    )
  }
}
