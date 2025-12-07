"use client"

import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircleIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCreateSchedule } from "../_hooks/use-timetable"
import { useSubjects } from "../_hooks/use-subjects"
import { useRooms } from "../_hooks/use-rooms"
import { useQuery } from "@tanstack/react-query"
import { TeachersAPI } from "@/lib/teachers"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
const TIME_SLOTS = [
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
]

const formSchema = z
  .object({
    day: z.string().min(1, "Day is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    period_type: z.enum(["ACADEMICS", "BREAK"]),
    subject_id: z.string().optional(),
    teacher_id: z.string().optional(),
    room_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.period_type === "ACADEMICS") {
        return !!data.subject_id && !!data.teacher_id
      }
      return true
    },
    {
      message: "Subject and Teacher are required for ACADEMICS",
      path: ["subject_id"], // Attach error to subject_id
    }
  )

interface CreateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClassId: string | null
}

export default function CreateScheduleModal({
  isOpen,
  onClose,
  selectedClassId,
}: CreateScheduleModalProps) {
  const { mutate: createSchedule, isPending } = useCreateSchedule()
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects()
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => TeachersAPI.getAll(),
  })

  const { data: roomsData, isLoading: isLoadingRooms } = useRooms()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: "",
      start_time: "",
      end_time: "",
      period_type: "ACADEMICS",
      subject_id: "",
      teacher_id: "",
      room_id: "",
    },
  })

  const periodType = watch("period_type")

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedClassId) {
      toast.error("Please select a class first")
      return
    }

    createSchedule(
      {
        ...values,
        class_id: selectedClassId,
        subject_id: values.period_type === "BREAK" ? undefined : values.subject_id,
        teacher_id: values.period_type === "BREAK" ? undefined : values.teacher_id,
        room_id: values.period_type === "BREAK" ? undefined : values.room_id,
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  const subjects = subjectsData?.data?.data || []
  const teachers = teachersData?.data?.data || []
  const rooms = roomsData?.data?.rooms || []

  const renderError = (error?: string) => {
    if (!error) return null
    return (
      <p className="mt-1 flex items-center gap-2 text-sm text-red-500">
        <AlertCircleIcon className="h-4 w-4" /> {error}
      </p>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-100 max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
          <DialogDescription>Add new schedule</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Period Type <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="period_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACADEMICS">ACADEMICS</SelectItem>
                    <SelectItem value="BREAK">BREAK</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {renderError(errors.period_type?.message)}
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Day <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="day"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {renderError(errors.day?.message)}
          </div>

          {periodType === "ACADEMICS" && (
            <>
              <div className="w-full">
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Subject <span className="text-red-600">*</span>
                </label>
                <Controller
                  control={control}
                  name="subject_id"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingSubjects}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingSubjects ? "Loading subjects..." : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {renderError(errors.subject_id?.message)}
              </div>

              <div className="w-full">
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Teacher <span className="text-red-600">*</span>
                </label>
                <Controller
                  control={control}
                  name="teacher_id"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingTeachers}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingTeachers ? "Loading teachers..." : "Select teacher"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {renderError(errors.teacher_id?.message)}
              </div>

              <div className="w-full">
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Room
                </label>
                <Controller
                  control={control}
                  name="room_id"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingRooms}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingRooms ? "Loading rooms..." : "Select room"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {renderError(errors.room_id?.message)}
              </div>
            </>
          )}

          <div className="w-full">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Start Time <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="start_time"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {renderError(errors.start_time?.message)}
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              End Time <span className="text-red-600">*</span>
            </label>
            <Controller
              control={control}
              name="end_time"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {renderError(errors.end_time?.message)}
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-full bg-[#DA3743] hover:bg-[#DA3743]/90 sm:flex-1"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
