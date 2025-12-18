import { apiFetch } from "./api/client"

export interface Subject {
  id: string
  name: string
  code?: string
  description?: string
  teacher_id?: string
  class_id?: string
}

interface ResponsePack<T> {
  data: T
  message: string
}

export const SubjectsAPI = {
  getSubjectsByTeacher: (teacherId: string) =>
    apiFetch<ResponsePack<Subject[]>>(
      `/class-subjects?teacher_id=${teacherId}`,
      undefined,
      true
    ),

  getAllSubjects: () =>
    apiFetch<ResponsePack<Subject[]>>("/class-subjects", undefined, true),
}
