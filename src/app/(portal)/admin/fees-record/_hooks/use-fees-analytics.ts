import { useQuery } from "@tanstack/react-query"
import { FeesAPI } from "@/lib/fees"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

export const useFeesAnalytics = (params?: {
  year?: number
  session_id?: string
  term_id?: string
}) => {
  const isSuperAdmin = useIsSuperAdmin()
  
  return useQuery({
    queryKey: ["fees-analytics", params],
    queryFn: () => FeesAPI.getAnalytics(params),
    refetchOnWindowFocus: false,
    staleTime: 0, // Always refetch to get latest session data
    refetchOnMount: true,
    enabled: !isSuperAdmin, // Disable for super admin
  })
}
