import { NextResponse } from "next/server"

const ACCESS_TOKEN_SECONDS = 4 * 60 * 60

export type SessionTokens = {
  access_token: string
  refresh_token: string
  session_id: string
  session_expires_at: string
  user_id?: string
}

export function setSessionCookies(response: NextResponse, tokens: SessionTokens) {
  const sessionExpiry = new Date(tokens.session_expires_at)
  if (
    !Number.isFinite(sessionExpiry.getTime()) ||
    sessionExpiry.getTime() <= Date.now()
  ) {
    throw new Error("Invalid session expiry")
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  }
  response.cookies.set("access_token", tokens.access_token, {
    ...options,
    maxAge: Math.min(
      ACCESS_TOKEN_SECONDS,
      Math.floor((sessionExpiry.getTime() - Date.now()) / 1000)
    ),
  })
  response.cookies.set("refresh_token", tokens.refresh_token, {
    ...options,
    expires: sessionExpiry,
  })
  response.cookies.set("session_id", tokens.session_id, {
    ...options,
    expires: sessionExpiry,
  })
  if (tokens.user_id) {
    response.cookies.set("user_id", tokens.user_id, {
      ...options,
      expires: sessionExpiry,
    })
  }
}
