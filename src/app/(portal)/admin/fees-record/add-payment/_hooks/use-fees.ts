import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FeesAPI } from "@/lib/fees"
import { toast } from "sonner"

export const useActiveFees = () => {
  return useQuery({
    queryKey: ["active-fees"],
    queryFn: () => FeesAPI.getActiveFees(),
  })
}

export const useFeeStudents = (feeId: string) => {
  return useQuery({
    queryKey: ["fee-students", feeId],
    queryFn: () => FeesAPI.getFeeStudents(feeId),
    enabled: !!feeId,
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => FeesAPI.createPayment(data),
    onSuccess: () => {
      // toast.success("Payment recorded successfully") // Success modal handles this
      queryClient.invalidateQueries({ queryKey: ["active-fees"] })
      queryClient.invalidateQueries({ queryKey: ["fee-students"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment")
    },
  })
}
