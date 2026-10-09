import { NextResponse } from "next/server"
import { setSessionCookies } from "../_session"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { access_token, refresh_token, session_id, session_expires_at, user } = body

    if (!access_token || !refresh_token || !session_id || !user) {
      return NextResponse.json(
        { message: "Missing required authentication data" },
        { status: 400 }
      )
    }

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

    setSessionCookies(response, {
      access_token,
      refresh_token,
      session_id,
      session_expires_at,
      user_id: user.id,
    })

    return response
  } catch (error) {
    console.error("[auto-login] Error:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Auto-login failed",
      },
      { status: 500 }
    )
  }
}
