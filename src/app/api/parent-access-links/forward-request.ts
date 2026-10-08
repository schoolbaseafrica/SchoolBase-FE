import { NextResponse } from "next/server"

type ParentLinkAction = "validate" | "complete-setup"

export async function forwardParentLinkRequest(req: Request, action: ParentLinkAction) {
  try {
    const body = await req.json()
    if (typeof body.token !== "string" || !body.token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    const url = new URL(req.url)
    const hostname =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || url.hostname
    const protocol = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
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

    const response = await fetch(
      `${backendBaseUrl}/api/v1/parent-access-links/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "validate"
            ? { token: body.token }
            : { token: body.token, newPassword: body.newPassword }
        ),
        cache: "no-store",
      }
    )
    const responseData = await response.json()
    const account = responseData.data
    const publicData =
      response.ok && account
        ? {
            message: responseData.message,
            status_code: responseData.status_code,
            data: {
              user: account.user,
              requires_password_reset: account.requires_password_reset,
            },
          }
        : responseData
    const nextResponse = NextResponse.json(publicData, { status: response.status })

    if (
      response.ok &&
      account?.access_token &&
      account?.refresh_token &&
      account?.session_id
    ) {
      const secure = process.env.NODE_ENV === "production"
      const options = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" }
      nextResponse.cookies.set("access_token", account.access_token, {
        ...options,
        expires: new Date(account.session_expires_at),
      })
      nextResponse.cookies.set("refresh_token", account.refresh_token, {
        ...options,
        maxAge: 60 * 60 * 24 * 7,
      })
      nextResponse.cookies.set("session_id", account.session_id, {
        ...options,
        maxAge: 60 * 60 * 24 * 365 * 10,
      })
      if (account.user?.id) {
        nextResponse.cookies.set("user_id", account.user.id, {
          ...options,
          maxAge: 60 * 60 * 24 * 365 * 10,
        })
      }
    }
    return nextResponse
  } catch (error) {
    console.error(`[parent-access-links/${action}] Error:`, error)
    return NextResponse.json(
      { message: "Unable to use parent access link" },
      { status: 500 }
    )
  }
}
