import { NextResponse } from "next/server"
import { cookies as getCookies } from "next/headers"
import { splitCookiesString } from "set-cookie-parser"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/* Helpers */
const ensureApiBaseUrl = (): string => {
  console.log("[_proxy] Checking API_BASE_URL...")
  if (!API_BASE_URL) throw new Error("API base url missing")
  console.log("[_proxy] API_BASE_URL found:", API_BASE_URL)
  return API_BASE_URL.replace(/\/+$/, "")
}

const buildBackendUrl = (path: string): string => {
  const url = `${ensureApiBaseUrl()}/${path.replace(/^\/+/, "")}`
  console.log("[_proxy] Built backend URL:", url)
  return url
}

const extractAccessTokenFromSetCookie = (
  setCookieHeader: string | null
): string | null => {
  if (!setCookieHeader) return null
  const match = setCookieHeader.match(/access_token=([^;]+)/)
  console.log("[_proxy] Extracted access token from set-cookie:", match ? match[1] : null)
  return match ? match[1] : null
}

/* Forward request */
const forwardRequest = async (
  backendUrl: string,
  method: string,
  body: string | undefined,
  headers: Headers
): Promise<Response> => {
  console.log(`[proxy] Forwarding request: ${method} ${backendUrl}`)
  console.log("[proxy] Headers:", Object.fromEntries(headers.entries()))
  if (body) console.log("[proxy] Body:", body)

  try {
    const res = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    })
    console.log(`[proxy] Backend response status: ${res.status}`)
    return res
  } catch (err) {
    console.error("[proxy] Error in forwardRequest:", err)
    throw err
  }
}

/* Attempt Refresh Token */
const attemptRefresh = async (): Promise<{
  ok: boolean
  newAccessToken: string | null
  refreshResponse: Response | null
}> => {
  console.log("[proxy] Attempting token refresh...")
  const refreshUrl = buildBackendUrl("auth/refresh")
  const cookieStore = await getCookies()
  const refreshToken = cookieStore.get("refresh_token")?.value
  console.log("[proxy] Found refresh token:", refreshToken ? true : false)

  if (!refreshToken) return { ok: false, newAccessToken: null, refreshResponse: null }

  try {
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: { cookie: `refresh_token=${refreshToken}` },
      cache: "no-store",
    })
    console.log(`[proxy] Refresh response status: ${res.status}`)
    if (!res.ok) return { ok: false, newAccessToken: null, refreshResponse: res }

    const setCookieHeader = res.headers.get("set-cookie")
    const newAccessToken = extractAccessTokenFromSetCookie(setCookieHeader)
    return { ok: true, newAccessToken, refreshResponse: res }
  } catch (err) {
    console.error("[proxy] Error during token refresh:", err)
    return { ok: false, newAccessToken: null, refreshResponse: null }
  }
}

/* MAIN PROXY */
export const proxyAuthRequest = async (req: Request, pathname: string) => {
  console.log("[proxy] Starting proxy for path:", pathname)
  try {
    const backendUrl = buildBackendUrl(pathname)
    const rawBody = await req.text()
    console.log("[proxy] Request body length:", rawBody.length)

    const headers = new Headers()
    for (const [key, value] of req.headers.entries()) {
      const lower = key.toLowerCase()
      if (
        ["host", "connection", "content-length", "expect"].includes(lower) ||
        value === null
      )
        continue
      headers.set(key, value)
    }

    const cookieStore = await getCookies()
    const accessToken = cookieStore.get("access_token")?.value
    console.log("[proxy] Current access token present:", accessToken ? true : false)
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)

    let backendRes = await forwardRequest(
      backendUrl,
      req.method,
      rawBody.length ? rawBody : undefined,
      headers
    )

    if (backendRes.status === 401) {
      console.log("[proxy] Received 401, attempting refresh...")
      const refresh = await attemptRefresh()
      if (refresh.ok && refresh.newAccessToken) {
        console.log(
          "[proxy] Refresh successful, retrying original request with new access token..."
        )
        headers.set("Authorization", `Bearer ${refresh.newAccessToken}`)
        backendRes = await forwardRequest(
          backendUrl,
          req.method,
          rawBody.length ? rawBody : undefined,
          headers
        )
      } else {
        console.log("[proxy] Refresh failed or no new token")
      }
    }

    const responseText = await backendRes.text()
    const nextRes = new NextResponse(responseText || null, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    })

    const setCookieHeader = backendRes.headers.get("set-cookie")
    if (setCookieHeader) {
      console.log("[proxy] Propagating set-cookie headers")
      const cookies = splitCookiesString(setCookieHeader)
      cookies.forEach((cookie) => {
        console.log("[proxy] Set cookie:", cookie)
        nextRes.headers.append("set-cookie", cookie)
      })
    }

    console.log("[proxy] Returning response with status:", backendRes.status)
    return nextRes
  } catch (err) {
    console.error("[proxy] Proxy error caught:", err)
    return NextResponse.json(
      { message: "Proxy error. Please try again later." },
      { status: 502 }
    )
  }
}
