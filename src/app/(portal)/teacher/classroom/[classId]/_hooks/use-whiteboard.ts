import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { WhiteboardAPI, UpdateWhiteboardData } from "@/lib/whiteboard"
import { toast } from "sonner"

export const WHITEBOARD_KEY = (classId: string) => ["whiteboard", classId]

/**
 * Get whiteboard for a class
 * @param classId - The class ID
 * @param options - Optional configuration
 * @param options.enablePolling - Enable polling for real-time updates (default: false, set to true for students)
 */
export function useWhiteboard(classId: string, options?: { enablePolling?: boolean }) {
  const { enablePolling = false } = options || {}

  return useQuery({
    queryKey: WHITEBOARD_KEY(classId),
    queryFn: () => WhiteboardAPI.getByClass(classId),
    enabled: !!classId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: enablePolling ? 3000 : false, // Poll every 3 seconds if enabled (for students), disabled for teachers
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid conflicts
    refetchOnMount: true, // Always refetch on mount to get latest data
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (Forbidden) errors - user doesn't have access
      if (error?.response?.status === 403) {
        return false
      }
      // Retry other errors up to 1 time
      return failureCount < 1
    },
  })
}

/**
 * Update whiteboard state
 */
export function useUpdateWhiteboard(classId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateWhiteboardData) => {
      console.log("[useUpdateWhiteboard] Updating whiteboard with data:", data)
      const result = await WhiteboardAPI.update(classId, data)
      console.log("[useUpdateWhiteboard] API returned:", result)
      return result
    },
    onSuccess: (updatedData) => {
      console.log("[useUpdateWhiteboard] Update successful, updating cache:", updatedData)
      // Update the cache directly with the new data
      // This ensures React Query has the latest data without triggering a refetch
      queryClient.setQueryData(WHITEBOARD_KEY(classId), (oldData: any) => {
        // Merge with existing data to preserve all fields
        const merged = {
          ...oldData,
          ...updatedData,
        }
        console.log("[useUpdateWhiteboard] Merged cache data:", merged)
        return merged
      })
    },
    onError: (error: Error) => {
      console.error("[useUpdateWhiteboard] Update failed:", error)
      toast.error(error.message || "Failed to update whiteboard")
    },
  })
}
