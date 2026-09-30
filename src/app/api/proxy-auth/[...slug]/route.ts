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

  const backendRes = await proxyAuthRequest(req, pathWithQuery)

  const contentType = backendRes.headers.get("content-type") ?? ""
  if (
    contentType.startsWith("audio/") ||
    contentType.startsWith("video/") ||
    contentType === "application/octet-stream"
  ) {
    const body = await backendRes.arrayBuffer()
    const mediaHeaders = new Headers()
    mediaHeaders.set("Content-Type", contentType || "application/octet-stream")
    mediaHeaders.set("Content-Length", String(body.byteLength))
    mediaHeaders.set(
      "Cache-Control",
      backendRes.headers.get("cache-control") ?? "private, max-age=300"
    )
    mediaHeaders.set(
      "Content-Disposition",
      backendRes.headers.get("content-disposition") ?? "inline"
    )
    return new NextResponse(body, {
      status: backendRes.status,
      headers: mediaHeaders,
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
      const deleteContentType = backendRes.headers.get("content-type")
      if (!deleteContentType || !deleteContentType.includes("application/json")) {
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
