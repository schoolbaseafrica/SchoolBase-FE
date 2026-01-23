import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ClassesAPI,
  CreateClassData,
  UpdateClassData,
  PromotionPreviewPayload,
  PromotionExecutePayload,
} from "@/lib/classes"
import { toast } from "sonner"
// import { AxiosError } from "axios"
import { extractErrorMessage } from "@/lib/error-handler"
import { useClassesStore } from "@/store/classes-store"
import { useEffect } from "react"
import { useIsSuperAdmin } from "@/hooks/use-is-super-admin"

// QUERY KEYS
export const CLASS_KEYS = {
  all: ["classes"],
  detail: (id: string) => ["class", id],
  teachers: (id: string) => ["class_teachers", id],
}

// GET ALL (GROUPED)
export const useGetClassesInfo = (params?: {
  page?: number
  limit?: number
  includeArchived?: boolean
  includeAllSessions?: boolean
}) => {
  const isSuperAdmin = useIsSuperAdmin()
  const setClassItems = useClassesStore((state) => state.setClassItems)
  const setLoading = useClassesStore((state) => state.setLoading)
  // const setError = useClassesStore((state) => state.setError)

  const query = useQuery({
    queryKey: [...CLASS_KEYS.all, params?.includeArchived, params?.includeAllSessions],
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await ClassesAPI.getAll(params)
        return res.data
      } finally {
        setLoading(false)
      }
    },
    // select: (data) => data.data, // Already returned data in queryFn
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts to get fresh data after mutations
    staleTime: 0, // Consider data stale immediately to allow refetching
    enabled: !isSuperAdmin, // Disable for super admin
  })

  useEffect(() => {
    if (query.data?.items) {
      setClassItems(query.data.items)
    }
  }, [query.data, setClassItems])

  return query
}

export const useGetClass = (id: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: CLASS_KEYS.detail(id),
    queryFn: () => ClassesAPI.getOne(id),
    select: (data) => data.data,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false && !!id,
  })

// CREATE CLASS
export const useCreateClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassData) => ClassesAPI.create(data),
    onSuccess: async () => {
      toast.success("Class created successfully")
      // Invalidate all class queries (this matches both ["classes", false] and ["classes", true])
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.all, exact: false })
      // Force refetch all active queries that start with CLASS_KEYS.all
      await qc.refetchQueries({ queryKey: CLASS_KEYS.all, exact: false, type: "active" })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// UPDATE CLASS
export const useUpdateClass = (classID: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateClassData) =>
      ClassesAPI.update(id, data),
    onSuccess: async () => {
      toast.success("Class updated successfully")
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.detail(classID) })
      await qc.refetchQueries({ queryKey: CLASS_KEYS.all, type: "active" })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

// DELETE CLASS
export const useDeleteClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ClassesAPI.delete(id),
    onSuccess: async () => {
      toast.success("Class archived successfully")
      // Invalidate and refetch all class queries to ensure UI updates
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
      // Force refetch active queries
      await qc.refetchQueries({ queryKey: CLASS_KEYS.all, type: "active" })
    },
    onError: (err) => {
      const errorMessage = extractErrorMessage(err)
      // If already archived, refresh the list to remove it from active view
      // (this handles stale cache where archived class still shows in active list)
      if (errorMessage?.toLowerCase().includes("already archived")) {
        qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
        qc.refetchQueries({ queryKey: CLASS_KEYS.all, type: "active" })
        toast.info("Class is already archived. Refreshing list...")
        return
      }
      toast.error(errorMessage || "Failed to archive class")
    },
  })
}

// REACTIVATE CLASS
export const useReactivateClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ClassesAPI.reactivate(id),
    onSuccess: async () => {
      toast.success("Class reactivated successfully")
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
      await qc.refetchQueries({ queryKey: CLASS_KEYS.all, type: "active" })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

export const SUBJECTS_FOR_CLASS_KEY = "class_subjects"

export const useGetSubjectsForClass = (classID: string) =>
  useQuery({
    queryKey: [SUBJECTS_FOR_CLASS_KEY, classID],
    queryFn: async () => {
      const res = await ClassesAPI.getSubjectsForClass(classID)
      return res?.data
    },
    enabled: !!classID,
  })

// ASSIGN TEACHERS TO CLASS SUBJECT
export const useAssignTeachersToClassSubject = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: { class_subject_id: string; teacher_id: string }) =>
      ClassesAPI.assignTeachersToClassSubject(data.class_subject_id, data.teacher_id),
    onSuccess: () => {
      toast.success("Teachers assigned successfully")
      qc.invalidateQueries({ queryKey: [SUBJECTS_FOR_CLASS_KEY] })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

export const useUnassignTeachersToClassSubject = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (class_subject_id: string) =>
      ClassesAPI.unassignTeachersFromClassSubject(class_subject_id),
    onSuccess: () => {
      toast.success("Teacher unassigned successfully")
      qc.invalidateQueries({ queryKey: [SUBJECTS_FOR_CLASS_KEY] })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

export const useGetClassStudents = (classID: string) => {
  return useQuery({
    queryKey: ["class_students", classID],
    queryFn: () => ClassesAPI.getStudentsForClass(classID),
    select: (data) => data.data,
    enabled: !!classID,
    refetchOnWindowFocus: false,
  })
}

export const useAddStudentsToClass = (classID: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (studentIds: string[]) =>
      ClassesAPI.addStudentsToClass(classID, studentIds),
    onSuccess: async () => {
      toast.success("Students added to class successfully")
      await qc.invalidateQueries({ queryKey: ["class_students", classID] })
      await qc.invalidateQueries({ queryKey: ["students"] })
      await qc.refetchQueries({ queryKey: ["class_students", classID] })
    },
    onError: (err) => {
      const errorMessage = extractErrorMessage(err)
      console.error("Error assigning students to class:", {
        classID,
        error: err,
        errorMessage,
      })
      toast.error(errorMessage || "Failed to assign students to class. Please try again.")
    },
  })
}

export const useAssignStudentToClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      ClassesAPI.assignStudentToClass(classId, studentId),
    onSuccess: async () => {
      toast.success("Student assigned to class successfully")
      await qc.invalidateQueries({ queryKey: ["class_students"] })
      await qc.invalidateQueries({ queryKey: ["students"] })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

export const useRemoveStudentFromClass = (classID: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) =>
      ClassesAPI.removeStudentFromClass(classID, studentId),
    onSuccess: async () => {
      toast.success("Student removed from class successfully")
      await qc.invalidateQueries({ queryKey: ["class_students", classID] })
      await qc.invalidateQueries({ queryKey: ["students"] })
      await qc.refetchQueries({ queryKey: ["class_students", classID] })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

function extractPromotionPreview(res: unknown): PromotionPreviewPayload {
  const r = res as any
  const data = r?.data ?? r
  return {
    sourceSessionId: data.sourceSessionId ?? "",
    targetSessionId: data.targetSessionId ?? "",
    mappings: data.mappings ?? [],
    errors: data.errors ?? [],
  }
}

function extractPromotionExecute(res: unknown): PromotionExecutePayload {
  const r = res as any
  // Handle both wrapped { data: {...} } and direct response structures
  const data = r?.data ?? r
  
  // Accept both 200 (OK) and 201 (Created) as success status codes
  // 201 is commonly used for creation operations
  if (r?.status_code && r.status_code !== 200 && r.status_code !== 201) {
    console.error("Promotion execute returned error status:", r)
    throw new Error(r?.message || "Promotion execution failed")
  }
  
  // Verify we have actual data
  if (!data || (data.promoted === undefined && data.skipped === undefined && data.failed === undefined)) {
    console.error("Invalid promotion execute response:", res)
    throw new Error("Invalid response from promotion execution")
  }
  
  return {
    promoted: data.promoted ?? 0,
    skipped: data.skipped ?? 0,
    failed: data.failed ?? 0,
    details: data.details ?? [],
  }
}

export const usePromotionPreview = () => {
  return useMutation({
    mutationFn: async (body: {
      sourceSessionId: string
      targetSessionId: string
      armMappings: { sourceClassId: string; targetClassId: string }[]
    }) => {
      console.log("[Promotion] Preview request:", body)
      const res = await ClassesAPI.promotionPreview(body)
      const extracted = extractPromotionPreview(res)
      console.log("[Promotion] Preview response:", {
        raw: res,
        extracted,
        mappingsCount: extracted.mappings?.length ?? 0,
        totalToPromote: extracted.mappings?.reduce((s, m) => s + (m.toPromote ?? 0), 0) ?? 0,
        totalAlreadyInTarget: extracted.mappings?.reduce((s, m) => s + (m.alreadyInTarget ?? 0), 0) ?? 0,
        errors: extracted.errors,
      })
      return extracted
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}

export const usePromotionExecute = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (body: {
      sourceSessionId: string
      targetSessionId: string
      armMappings: { sourceClassId: string; targetClassId: string }[]
    }) => {
      console.log("[Promotion] Execute request:", body)
      const res = await ClassesAPI.promotionExecute(body)
      const extracted = extractPromotionExecute(res)
      console.log("[Promotion] Execute response:", {
        raw: res,
        extracted,
        promoted: extracted.promoted,
        skipped: extracted.skipped,
        failed: extracted.failed,
        details: extracted.details,
      })
      return extracted
    },
    onSuccess: async (payload) => {
      const { promoted, skipped, failed } = payload
      
      // Check if promotion actually happened
      if (promoted === 0 && skipped === 0 && failed === 0) {
        toast.warning("No students were promoted. Please check that source classes have students assigned.")
        return
      }
      
      const parts: string[] = []
      if (promoted > 0) parts.push(`${promoted} promoted`)
      if (skipped > 0) parts.push(`${skipped} skipped (already in target)`)
      if (failed > 0) parts.push(`${failed} failed`)
      
      if (promoted > 0) {
        toast.success(`Promotion successful! ${parts.join(". ")}.`)
      } else if (failed > 0) {
        toast.error(`Promotion failed for ${failed} student${failed > 1 ? "s" : ""}. ${skipped > 0 ? `${skipped} were already in target.` : ""}`)
      } else {
        toast.info(`All students were already in target classes. ${skipped} skipped.`)
      }
      
      // Invalidate and refetch queries to refresh UI
      await qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
      await qc.invalidateQueries({ queryKey: ["class_students"] })
      await qc.invalidateQueries({ queryKey: ["students"] })
      await qc.refetchQueries({ queryKey: CLASS_KEYS.all, type: "active" })
      await qc.refetchQueries({ queryKey: ["class_students"], type: "active" })
      await qc.refetchQueries({ queryKey: ["students"], type: "active" })
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err))
    },
  })
}
