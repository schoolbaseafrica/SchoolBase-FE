import { useQuery } from "@tanstack/react-query"
import { FeesAPI, FeePaymentParams } from "@/lib/fees"

export const useFeePayments = (params?: FeePaymentParams) => {
  return useQuery({
    queryKey: ["fee-payments", params],
    queryFn: () => FeesAPI.getPayments(params),
    refetchOnWindowFocus: false,
  })
}
