import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FeesAPI, FeePaymentParams, UpdatePaymentPayload } from "@/lib/fees"
import { toast } from "sonner"

export const useFeePayments = (params?: FeePaymentParams) => {
  return useQuery({
    queryKey: ["fee-payments", params],
    queryFn: () => FeesAPI.getPayments(params),
    refetchOnWindowFocus: false,
    staleTime: 0, // Always refetch to get latest session data
    refetchOnMount: true,
  })
}

export const useUpdatePayment = (paymentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePaymentPayload) =>
      FeesAPI.updatePayment(paymentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-payments"] })
      toast.success("Payment updated successfully")
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to update payment")
    },
  })
}
