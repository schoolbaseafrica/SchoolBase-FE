import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      access_token,
      refresh_token,
      session_id,
      session_expires_at,
      user,
    } = body

    if (!access_token || !refresh_token || !session_id || !user) {
      return NextResponse.json(
        { message: "Missing required authentication data" },
        { status: 400 }
      )
    }

    const expiresAt = new Date(session_expires_at)

    // Create response
    const response = NextResponse.json(
      {
        message: "Auto-login successful",
        data: {
          user,
        },
      },
      { status: 200 }
    )

    // In production, use secure cookies. In development, allow insecure for localhost
    const SECURE = process.env.NODE_ENV === "production"
    // Use 'lax' instead of 'strict' for better cross-site compatibility
    // 'strict' can block cookies when navigating from external links (like access links)

    // Set cookies — HTTP-only for security
    // Use 'lax' sameSite for better compatibility with external link navigation
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax", // Changed from "strict" to allow cookies from external links
      path: "/",
      expires: expiresAt,
    })

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax", // Changed from "strict"
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days (fixed: removed 1000 multiplier)
    })

    response.cookies.set("session_id", session_id, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax", // Changed from "strict"
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years (effectively permanent)
    })

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax", // Changed from "strict"
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years (effectively permanent)
    })

    return response
  } catch (error) {
    console.error("[auto-login] Error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Auto-login failed",
      },
      { status: 500 }
    )
  }
}
