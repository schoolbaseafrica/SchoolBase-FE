import { NextResponse } from "next/server"
import { attemptRefresh } from "../_proxy"
import { setSessionCookies } from "../_session"

export async function POST(req: Request) {
  const session = await attemptRefresh(req)
  if (!session) return NextResponse.json({ message: "Session expired" }, { status: 401 })
  const response = NextResponse.json({ data: session })
  setSessionCookies(response, session)
  return response
}
