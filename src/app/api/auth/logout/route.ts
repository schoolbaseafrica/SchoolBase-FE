import { NextResponse } from "next/server"
import { proxyAuthRequest } from "../_proxy"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  // 1. Get cookies
  const cookieStore = await cookies()
  const session_id = cookieStore.get("session_id")?.value
  const user_id = cookieStore.get("user_id")?.value

  // Optional: read incoming body (if needed)
  const incomingBody = await req.json().catch(() => ({}))

  // 2. Build final request body including cookie values
  const body = {
    ...incomingBody,
    session_id,
    user_id,
  }

  // 3. Forward request + new body to backend
  const backendResponse = await proxyAuthRequest(
    new Request(req, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }),
    "/auth/sessions/revoke"
  )

  const data = await backendResponse.json()

  if (!data?.data) {
    return NextResponse.json(
      { message: "An unexpected error occurred during logout. Please try again later" },
      { status: 500 }
    )
  }
  // Create response with original backend data
  const response = NextResponse.json(data, {
    status: 200,
  })

  response.cookies.delete("access_token")
  response.cookies.delete("refresh_token")
  response.cookies.delete("session_id")
  response.cookies.delete("user_id")

  return response
}
