import { NextResponse } from "next/server"
import { cookies as getCookies } from "next/headers"
import { splitCookiesString } from "set-cookie-parser"

/* Helpers */
/**
 * Determines the backend API URL dynamically from the request.
 * For multi-school deployment, each school has its own backend domain.
 * Pattern: if frontend is at stpaul.schoolbase.africa, backend is at api.stpaul.schoolbase.africa
 */
const getBackendBaseUrl = (req: Request): string => {
  // Extract host from request URL or headers first (needed for dynamic construction)
  const url = new URL(req.url)
  const hostname = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.hostname
  const protocol = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
  
  console.log("[_proxy] Request hostname:", hostname, "protocol:", protocol)
  console.log("[_proxy] API_BASE_URL env:", process.env.API_BASE_URL || "not set")
  console.log("[_proxy] NEXT_PUBLIC_API_BASE_URL env:", process.env.NEXT_PUBLIC_API_BASE_URL || "not set")
  
  // Priority 1: Runtime environment variable (without NEXT_PUBLIC_ prefix)
  // This is set in docker-compose.yml for each school
  if (process.env.API_BASE_URL) {
    const apiBaseUrl = process.env.API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    console.log("[_proxy] Using runtime API_BASE_URL:", apiBaseUrl)
    return apiBaseUrl
  }
  
  // Priority 2: Construct dynamically from request hostname (most reliable for multi-school)
  // For multi-school deployment, prepend 'api.' to the hostname
  // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
  // e.g., demo.schoolbase.africa -> api.demo.schoolbase.africa
  if (hostname && hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
    // Check if hostname already starts with 'api.'
    if (hostname.startsWith("api.")) {
      // Already an API domain, use as-is
      const backendUrl = `${protocol}://${hostname}`
      console.log("[_proxy] Hostname already starts with 'api.', using as-is:", backendUrl)
      return backendUrl
    }
    
    // Prepend 'api.' to the hostname
    const backendHostname = `api.${hostname}`
    const backendUrl = `${protocol}://${backendHostname}`
    console.log("[_proxy] Constructed backend URL from hostname:", backendUrl)
    return backendUrl
  }
  
  // Priority 3: Runtime NEXT_PUBLIC_API_BASE_URL (might be baked at build time, less reliable)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "")
    console.log("[_proxy] WARNING: Using NEXT_PUBLIC_API_BASE_URL (may be from build time):", apiBaseUrl)
    return apiBaseUrl
  }
  
  // Fallback for localhost or single-domain setups
  const fallbackUrl = `${protocol}://${hostname}:${process.env.BACKEND_PORT || process.env.PORT || 3008}`
  console.log("[_proxy] Using fallback backend URL (localhost):", fallbackUrl)
  return fallbackUrl
}

const buildBackendUrl = (req: Request, path: string): string => {
  const baseUrl = getBackendBaseUrl(req)
  const url = `${baseUrl}/${path.replace(/^\/+/, "")}`
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
  body: string | ArrayBuffer | FormData | undefined,
  headers: Headers
): Promise<Response> => {
  console.log(`[proxy] Forwarding request: ${method} ${backendUrl}`)
  console.log("[proxy] Headers:", Object.fromEntries(headers.entries()))
  if (body && typeof body === "string")
    console.log("[proxy] Body (string):", body.substring(0, 100))

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
const attemptRefresh = async (req: Request): Promise<{
  ok: boolean
  newAccessToken: string | null
  refreshResponse: Response | null
}> => {
  console.log("[proxy] Attempting token refresh...")
  const refreshUrl = buildBackendUrl(req, "api/v1/auth/refresh")
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
    const backendUrl = buildBackendUrl(req, pathname)

    // Detect content type to handle FormData correctly
    const contentType = req.headers.get("content-type") || ""
    const isMultipart = contentType.includes("multipart/form-data")

    // For multipart/form-data, use arrayBuffer to preserve binary data
    // For other types, use text() for easier handling
    let rawBody: string | ArrayBuffer | undefined
    if (isMultipart) {
      rawBody = await req.arrayBuffer()
      console.log("[proxy] Request body (multipart) length:", rawBody.byteLength)
    } else {
      const textBody = await req.text()
      rawBody = textBody.length > 0 ? textBody : undefined
      console.log("[proxy] Request body (text) length:", textBody.length)
    }

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

    let backendRes = await forwardRequest(backendUrl, req.method, rawBody, headers)

    if (backendRes.status === 401) {
      console.log("[proxy] Received 401, attempting refresh...")
      const refresh = await attemptRefresh(req)
      if (refresh.ok && refresh.newAccessToken) {
        console.log(
          "[proxy] Refresh successful, retrying original request with new access token..."
        )
        headers.set("Authorization", `Bearer ${refresh.newAccessToken}`)
        backendRes = await forwardRequest(backendUrl, req.method, rawBody, headers)
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
