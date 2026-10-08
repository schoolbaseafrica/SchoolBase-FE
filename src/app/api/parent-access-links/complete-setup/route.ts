import { forwardParentLinkRequest } from "../forward-request"

export async function POST(req: Request) {
  return forwardParentLinkRequest(req, "complete-setup")
}
