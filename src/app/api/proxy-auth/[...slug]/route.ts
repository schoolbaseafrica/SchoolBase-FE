import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../../auth/_proxy"

async function methodHandler(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params
  const slugPath = "/" + resolvedParams.slug.join("/")
  const reqUrl = new URL(req.url)
  const pathWithQuery = slugPath + reqUrl.search

  const backendRes = await proxyAuthRequest(req, pathWithQuery)

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

  const response = new NextResponse(body, {
    status: backendRes.status,
    headers: backendRes.headers, // preserves content-type, etc.
  })

  return response
}

export { methodHandler as GET }
export { methodHandler as POST }
export { methodHandler as PUT }
export { methodHandler as DELETE }
export { methodHandler as PATCH }
