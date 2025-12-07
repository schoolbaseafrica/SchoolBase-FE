import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ClassesAPI, CreateClassData, UpdateClassData } from "@/lib/classes"
import { toast } from "sonner"
import { AxiosError } from "axios"

// QUERY KEYS
export const CLASS_KEYS = {
  all: ["classes"],
  detail: (id: string) => ["class", id],
  teachers: (id: string) => ["class_teachers", id],
}

// GET ALL (GROUPED)
export const useGetClassesInfo = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: CLASS_KEYS.all,
    queryFn: () => ClassesAPI.getAll(params),
    select: (data) => data.data,
    refetchOnWindowFocus: false,
  })

export const useGetClass = (id: string) =>
  useQuery({
    queryKey: CLASS_KEYS.detail(id),
    queryFn: () => ClassesAPI.getOne(id),
    select: (data) => data.data,
    refetchOnWindowFocus: false,
  })

// CREATE CLASS
export const useCreateClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassData) => ClassesAPI.create(data),
    onSuccess: () => {
      //   toast.success(res.message)
      qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to create class")
      }
    },
  })
}

// UPDATE CLASS
export const useUpdateClass = (classID: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateClassData) =>
      ClassesAPI.update(id, data),
    onSuccess: () => {
      //   toast.success(res.message)
      qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
      qc.invalidateQueries({ queryKey: CLASS_KEYS.detail(classID) })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to update class")
      }
    },
  })
}

// DELETE CLASS
export const useDeleteClass = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ClassesAPI.delete(id),
    onSuccess: () => {
      toast.success("Class deleted successfully")
      qc.invalidateQueries({ queryKey: CLASS_KEYS.all })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to delete class")
      }
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
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to assign teachers")
      }
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
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to unassign teacher")
      }
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
    onSuccess: () => {
      toast.success("Students added to class successfully")
      qc.invalidateQueries({ queryKey: ["class_students", classID] })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to add students to class")
      }
    },
  })
}

export const useRemoveStudentFromClass = (classID: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) =>
      ClassesAPI.removeStudentFromClass(classID, studentId),
    onSuccess: () => {
      toast.success("Student removed from class successfully")
      qc.invalidateQueries({ queryKey: ["class_students", classID] })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err?.message ?? "Failed to remove student from class")
      }
    },
  })
}
