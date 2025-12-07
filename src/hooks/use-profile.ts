import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserProfileNew, UpdateProfileRequestNew, ApiResponse } from "@/types/profile"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import { useAuthStore } from "@/store/auth-store"

export const useGetProfile = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfileNew> => {
      try {
        // Use your existing apiFetch with proxy
        const res = await apiFetch<ApiResponse<UserProfileNew>>(
          "/auth/me",
          { method: "GET" },
          true // use proxy
        )

        if (!res.data) {
          throw new Error("Failed to fetch profile: No data returned")
        }

        // Update auth store with the fetched user
        setUser(res.data)

        return res.data
      } catch (error) {
        console.error("Error fetching profile:", error)
        // Don't throw the raw error, throw a user-friendly message
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unable to load profile. Please try again."
        )
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  return useMutation({
    mutationFn: async (data: UpdateProfileRequestNew): Promise<UserProfileNew> => {
      const response = await apiFetch<ApiResponse<UserProfileNew>>(
        "/users",
        {
          method: "PATCH",
          data,
        },
        true // use proxy
      )

      if (!response.data) {
        throw new Error("Failed to update profile: No data returned")
      }

      return response.data
    },
    onSuccess: (data) => {
      // Update both the query cache and auth store
      queryClient.setQueryData(["profile"], data)
      setUser(data)
      updateProfile(data)
      toast.success("Profile updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })
}
