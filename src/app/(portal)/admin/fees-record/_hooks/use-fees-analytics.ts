import { useQuery } from "@tanstack/react-query"
import { FeesAPI } from "@/lib/fees"

export const useFeesAnalytics = (params?: {
  year?: number
  session_id?: string
  term_id?: string
}) => {
  return useQuery({
    queryKey: ["fees-analytics", params],
    queryFn: () => FeesAPI.getAnalytics(params),
    refetchOnWindowFocus: false,
  })
}
