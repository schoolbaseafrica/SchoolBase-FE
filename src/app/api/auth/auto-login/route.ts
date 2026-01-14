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

    const SECURE = process.env.NODE_ENV === "production"

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

    response.cookies.set("session_id", session_id, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      path: "/",
      maxAge: Infinity,
    })

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      path: "/",
      maxAge: Infinity,
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
