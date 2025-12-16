import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TimetableAPI, CreateSchedulePayload } from "@/lib/timetable"
import { toast } from "sonner"
import { useTimetableStore } from "@/store/timetable-store"
import { useEffect } from "react"

export const useClassTimetable = (classId: string) => {
  const setTimetable = useTimetableStore((state) => state.setTimetable)
  const setLoading = useTimetableStore((state) => state.setLoading)
  // const setError = useTimetableStore((state) => state.setError)

  const query = useQuery({
    queryKey: ["timetable", classId],
    queryFn: async () => {
      setLoading(true)
      try {
        const res = await TimetableAPI.getClassTimetable(classId)
        return res.data
      } finally {
        setLoading(false)
      }
    },
    enabled: !!classId,
  })

  useEffect(() => {
    if (query.data?.schedules && classId) {
      setTimetable(classId, query.data.schedules)
    }
  }, [query.data, classId, setTimetable])

  return query
}

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSchedulePayload) => TimetableAPI.createSchedule(data),
    onSuccess: () => {
      toast.success("Schedule created successfully")
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create schedule")
    },
  })
}

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchedulePayload> }) =>
      TimetableAPI.updateSchedule(id, data),
    onSuccess: () => {
      toast.success("Schedule updated successfully")
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update schedule")
    },
  })
}

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TimetableAPI.deleteSchedule(id),
    onSuccess: () => {
      toast.success("Schedule deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete schedule")
    },
  })
}
