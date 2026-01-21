"use client"

import { extractErrorMessage } from "@/lib/error-handler"
import type {
  CreateFeeComponentData,
  UpdateFeeComponentData,
} from "@/lib/fees-management"
import { FeesAPI } from "@/lib/fees-management"
import { useFeesStore } from "@/store/fees-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"

const FEES_KEY = ["fees"]

// ----------------------
// GET ALL FEES
// ----------------------
export const useGetFees = () => {
  const setFees = useFeesStore((state) => state.setFees)
  const setLoading = useFeesStore((state) => state.setLoading)
  // const setError = useFeesStore((state) => state.setError)

  const query = useQuery({
    queryKey: FEES_KEY,
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await FeesAPI.getAll({ limit: 1000 })
        return res.data
      } finally {
        setLoading(false)
      }
    },
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (query.data?.fees) {
      setFees(query.data.fees)
    }
  }, [query.data, setFees])

  return query
}

// ----------------------
// GET ONE FEE
// ----------------------
export const useGetFee = (id: string) => {
  const feeFromStore = useFeesStore((state) => (id ? state.getFeeById(id) : undefined))

  return useQuery({
    queryKey: [...FEES_KEY, id],
    queryFn: () => FeesAPI.getOne(id),
    enabled: !!id,
    initialData: feeFromStore
      ? { status_code: 200, message: "from store", data: feeFromStore }
      : undefined,
    select: (data) => data.data,
  })
}

// ----------------------
// CREATE FEE
// ----------------------
export const useCreateFee = () => {
  const queryClient = useQueryClient()
  const addFee = useFeesStore((state) => state.addFee)

  return useMutation({
    mutationFn: (data: CreateFeeComponentData) => FeesAPI.create(data),

    onSuccess: async (res) => {
      // Handle both response structures for backward compatibility
      const fee = res.data || (res as any).fee
      if (fee && fee.id) {
        try {
          addFee(fee)
        } catch (error) {
          console.error("[useCreateFee] Error adding fee to store:", error)
        }
      } else {
        console.warn("[useCreateFee] Invalid fee response structure:", res)
      }
      
      // Invalidate and force refetch to ensure fresh data from server
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success("Fee component created successfully")
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// ----------------------
// UPDATE FEE
// ----------------------
export const useUpdateFee = (id: string) => {
  const queryClient = useQueryClient()
  const updateFee = useFeesStore((state) => state.updateFee)

  return useMutation({
    mutationFn: (data: UpdateFeeComponentData) => FeesAPI.update(id, data),

    onSuccess: async (res) => {
      // Handle both response structures for backward compatibility
      const fee = res.data || (res as any).fee
      if (fee && id) {
        try {
          updateFee(id, fee)
        } catch (error) {
          console.error("[useUpdateFee] Error updating fee in store:", error)
        }
      } else {
        console.warn("[useUpdateFee] Invalid fee response structure:", res)
      }
      
      // Invalidate and force refetch to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.invalidateQueries({ 
        queryKey: [...FEES_KEY, id],
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success("Fee component updated successfully")
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// ----------------------
// 🔵 DEACTIVATE FEE
// ----------------------
export const useDeactivateFee = (id: string) => {
  const queryClient = useQueryClient()
  const updateFee = useFeesStore((state) => state.updateFee)

  return useMutation({
    mutationFn: (reason: string) => FeesAPI.deactivate(id, reason),

    onSuccess: async (res) => {
      if (res.data) updateFee(id, res.data)
      
      // Invalidate and force refetch to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success("Fee component deactivated successfully")
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// ----------------------
// ACTIVATE FEE
// ----------------------
export const useAactivateFee = (id: string) => {
  const queryClient = useQueryClient()
  const updateFee = useFeesStore((state) => state.updateFee)

  return useMutation({
    mutationFn: (reason: string) => FeesAPI.activate(id, reason),

    onSuccess: async (res) => {
      // Handle both response structures for backward compatibility
      const fee = res.data || (res as any).fee
      if (fee && id) {
        try {
          updateFee(id, fee)
        } catch (error) {
          console.error("[useAactivateFee] Error updating fee in store:", error)
        }
      } else {
        console.warn("[useAactivateFee] Invalid fee response structure:", res)
      }
      
      // Invalidate and force refetch to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success("Fee component activated successfully")
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// ----------------------
// ASSIGN STUDENTS TO FEE
// ----------------------
export const useAssignStudentsToFee = (feeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentIds: string[]) => FeesAPI.assignStudents(feeId, studentIds),

    onSuccess: async (res) => {
      const { assigned, already_assigned } = res.data
      let message = `Successfully assigned fee to ${assigned} student(s).`
      if (already_assigned > 0) {
        message += ` ${already_assigned} student(s) were already assigned.`
      }
      
      // Invalidate and force refetch to ensure fresh data (including is_assigned status)
      await queryClient.invalidateQueries({ 
        queryKey: [...FEES_KEY, feeId],
        refetchType: "active"
      })
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success(message)
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// ----------------------
// UNASSIGN STUDENTS FROM FEE
// ----------------------
export const useUnassignStudentsFromFee = (feeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentIds: string[]) => FeesAPI.unassignStudents(feeId, studentIds),

    onSuccess: async (res) => {
      const { unassigned } = res.data
      
      // Invalidate and force refetch to ensure fresh data (including is_assigned status)
      await queryClient.invalidateQueries({ 
        queryKey: [...FEES_KEY, feeId],
        refetchType: "active"
      })
      await queryClient.invalidateQueries({ 
        queryKey: FEES_KEY,
        refetchType: "active"
      })
      await queryClient.refetchQueries({ 
        queryKey: FEES_KEY,
        type: "active"
      })
      
      toast.success(`Successfully unassigned fee from ${unassigned} student(s).`)
    },

    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}
