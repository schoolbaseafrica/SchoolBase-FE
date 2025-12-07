import { UserProfileNew, UpdateProfileRequestNew } from "@/types/profile"
import { apiFetch } from "@/lib/api/client"

// Keep only if needed elsewhere, otherwise you can remove this file
// since hooks are using apiFetch directly

export const getProfileClient = async (): Promise<UserProfileNew> => {
  const res = await apiFetch<{ data: UserProfileNew }>(
    "/auth/me",
    { method: "GET" },
    true
  )
  if (!res.data) throw new Error("Failed to fetch profile")
  return res.data
}

export const updateProfileClient = async (
  data: UpdateProfileRequestNew
): Promise<UserProfileNew> => {
  const response = await apiFetch<{ data: UserProfileNew }>(
    "/users",
    {
      method: "PATCH",
      data,
    },
    true
  )
  if (!response.data) throw new Error("Failed to update profile")
  return response.data
}
