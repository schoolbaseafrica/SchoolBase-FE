import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../_proxy"

export async function POST(req: Request) {
  // Call your backend
  const backendResponse = await proxyAuthRequest(req, "/auth/login")

  const data = await backendResponse.json()

  if (data?.data) {
    const {
      access_token,
      refresh_token,
      session_id,
      session_expires_at,
      user: { id: user_id },
    } = data.data
    const expiresAt = new Date(session_expires_at)

    // Create response with original backend data
    const response = NextResponse.json(data, {
      status: 200,
    })

    const SECURE = false // so i fit comot am while testing

    // Set cookies — HTTP-only for security
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      path: "/",
      expires: expiresAt,
    })

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    // Set cookies — HTTP-only for security
    response.cookies.set("session_id", session_id, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      path: "/",
      maxAge: Infinity,
    })

    response.cookies.set("user_id", user_id, {
      httpOnly: true,
      secure: SECURE,
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
}
