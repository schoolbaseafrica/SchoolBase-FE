import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TimetableAPI, CreateSchedulePayload } from "@/lib/timetable"
import { toast } from "sonner"

export const useClassTimetable = (classId: string) => {
  return useQuery({
    queryKey: ["timetable", classId],
    queryFn: () => TimetableAPI.getClassTimetable(classId),
    enabled: !!classId,
  })
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
