import { apiFetch } from "@/lib/api/client"

// Types
export interface JoinWaitlistPayload {
  email: string
  // reverts back to camel case on backend
  firstName: string
  lastName: string
}

export interface JoinWaitlistResponse {
  message: string
  status: string
}

// POST: Join Waitlist
export function joinWaitlist(payload: JoinWaitlistPayload) {
  return apiFetch<JoinWaitlistResponse>(
    "/waitlist",
    {
      method: "POST",
      data: payload,
    },
    true // use backend proxy
  )
}
