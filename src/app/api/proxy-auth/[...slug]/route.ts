import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../../auth/_proxy"

async function methodHandler(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params
  // Prepend /api/v1 to the slug path for the backend
  const slugPath = "/api/v1/" + resolvedParams.slug.join("/")
  const reqUrl = new URL(req.url)
  const pathWithQuery = slugPath + reqUrl.search

  // Log fee students requests for debugging
  if (slugPath.includes("/fees/") && slugPath.includes("/students")) {
    console.log("[proxy-auth] Fee students request:", {
      method: req.method,
      slug: resolvedParams.slug,
      slugPath,
      pathWithQuery,
      fullUrl: req.url,
    })
  }

  const backendRes = await proxyAuthRequest(req, pathWithQuery)
  
  // Log fee students responses for debugging
  if (slugPath.includes("/fees/") && slugPath.includes("/students")) {
    console.log("[proxy-auth] Fee students response:", {
      status: backendRes.status,
      statusText: backendRes.statusText,
      contentType: backendRes.headers.get("content-type"),
    })
  }

  // Special handling for DELETE requests with no content
  if (req.method === "DELETE") {
    // For DELETE requests, 204 No Content or 200 with no body are common
    if (backendRes.status === 204 || backendRes.status === 200) {
      // Return empty response with success status
      return new NextResponse(null, {
        status: backendRes.status,
        headers: backendRes.headers,
      })
    }

    // If DELETE returns 200 with content, handle it
    if (backendRes.status === 200) {
      const contentType = backendRes.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // If not JSON, assume empty success response
        return new NextResponse(null, {
          status: 200,
          headers: backendRes.headers,
        })
      }
    }
  }

  const body = await backendRes.text() // read once safely

  // Handle empty responses for other methods too
  if (!body && backendRes.status === 200) {
    return new NextResponse(null, {
      status: backendRes.status,
      headers: backendRes.headers,
    })
  }

  // For error responses, ensure we preserve the error body
  // This is critical for axios to capture the error details
  const responseHeaders = new Headers(backendRes.headers)
  
  // Ensure content-type is set for error responses
  if (backendRes.status >= 400 && !responseHeaders.get("content-type")) {
    responseHeaders.set("content-type", "application/json; charset=utf-8")
  }

  const response = new NextResponse(body || null, {
    status: backendRes.status,
    headers: responseHeaders,
  })

  return response
}

export { methodHandler as GET }
export { methodHandler as POST }
export { methodHandler as PUT }
export { methodHandler as DELETE }
export { methodHandler as PATCH }
