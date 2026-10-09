import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../_proxy"
import { setSessionCookies } from "../_session"

export async function POST(req: Request) {
  // Call your backend (backend uses /api/v1 prefix)
  const backendResponse = await proxyAuthRequest(req, "/api/v1/auth/login")

  const data = await backendResponse.json()

  if (data?.data) {
    const {
      access_token,
      refresh_token,
      session_id,
      session_expires_at,
      user: { id: user_id },
    } = data.data
    // Create response with original backend data
    const response = NextResponse.json(data, {
      status: 200,
    })

    setSessionCookies(response, {
      access_token,
      refresh_token,
      session_id,
      session_expires_at,
      user_id,
    })

    return response
  }

  // === ERROR ===
  // Return EXACT backend status + body
  return new NextResponse(typeof data === "string" ? data : JSON.stringify(data), {
    status: backendResponse.status,
    headers: { "Content-Type": "application/json" },
  })
}
