"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { FeesAPI } from "@/lib/fees-management"
import type {
  CreateFeeComponentData,
  UpdateFeeComponentData,
  FeeComponent,
} from "@/lib/fees-management"

// This matches your ACTUAL API response structure
interface FeeListData {
  fees: FeeComponent[] | null
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FeeListResponse {
  status_code: number
  message: string
  data: FeeListData
}

// Backend GET /fees/:id response
interface FeeItemResponse {
  status_code: number
  message: string
  data: FeeComponent
}

// ----------------------
// GET ALL FEES
// ----------------------
export const useGetFees = (params?: { page?: number; limit?: number }) => {
  return useQuery<FeeListResponse>({
    queryKey: ["fees", params],
    queryFn: () => FeesAPI.getAll(params),
  })
}

// ----------------------
// GET ONE FEE
// ----------------------
export const useGetFee = (id: string) => {
  return useQuery<FeeItemResponse>({
    queryKey: ["fee", id],
    queryFn: () => FeesAPI.getOne(id),
    enabled: !!id,
  })
}

// ----------------------
// CREATE FEE
// ----------------------
export const useCreateFee = () => {
  const queryClient = useQueryClient()

  return useMutation<FeeItemResponse, Error, CreateFeeComponentData>({
    mutationFn: (data) => FeesAPI.create(data),

    onSuccess: () => {
      toast.success("Fee component created successfully")
      queryClient.invalidateQueries({ queryKey: ["fees"] })
    },

    onError: (err) => {
      toast.error(err.message || "Failed to create fee component")
    },
  })
}

// ----------------------
// UPDATE FEE
// ----------------------
export const useUpdateFee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation<FeeItemResponse, Error, UpdateFeeComponentData>({
    mutationFn: (data) => FeesAPI.update(id, data),

    onSuccess: () => {
      toast.success("Fee component updated successfully")
      queryClient.invalidateQueries({ queryKey: ["fee", id] })
      queryClient.invalidateQueries({ queryKey: ["fees"] })
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update fee component")
    },
  })
}

// ----------------------
// 🔵 DEACTIVATE FEE
// ----------------------
export const useDeactivateFee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation<FeeItemResponse, Error, string>({
    // reason is the variable
    mutationFn: (reason) => FeesAPI.deactivate(id, reason),

    onSuccess: () => {
      toast.success("Fee component deactivated successfully")
      queryClient.invalidateQueries({ queryKey: ["fee", id] })
      queryClient.invalidateQueries({ queryKey: ["fees"] })
    },

    onError: (err) => {
      toast.error(err.message || "Failed to deactivate fee component")
    },
  })
}

// ----------------------
// ACTIVATE FEE
// ----------------------
export const useAactivateFee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation<FeeItemResponse, Error, string>({
    // reason is the variable
    mutationFn: (reason) => FeesAPI.activate(id, reason),

    onSuccess: () => {
      toast.success("Fee component activated successfully")
      queryClient.invalidateQueries({ queryKey: ["fee", id] })
      queryClient.invalidateQueries({ queryKey: ["fees"] })
    },

    onError: (err) => {
      toast.error(err.message || "Failed to activate fee component")
    },
  })
}

// ----------------------
// DELETE FEE
// ----------------------
// export const useDeleteFee = () => {
//   const queryClient = useQueryClient()

//   return useMutation<void, Error, string>({
//     mutationFn: (id) => FeesAPI.delete(id),

//     onSuccess: () => {
//       toast.success("Fee component deleted successfully")
//       queryClient.invalidateQueries({ queryKey: ["fees"] })
//     },

//     onError: (err) => {
//       toast.error(err.message || "Failed to delete fee component")
//     },
//   })
// }
