import { proxyAuthRequest } from "../_proxy"

export async function POST(req: Request) {
  return proxyAuthRequest(req, "/auth/refresh")
}
