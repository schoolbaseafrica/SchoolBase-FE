import { apiFetch } from "./api/client"

export type CreateClassData = {
  name: string
  arm?: string
  teacherIds?: string[]
}

export type UpdateClassData = Partial<CreateClassData>

type ResponsePack<T> = {
  message: string
  data: T
}

export interface ClassItem {
  name: string
  academicSession: {
    id: string
    name: string
  }
  classes: {
    id: string
    arm: string
  }[]
}

export interface SingleClass {
  id: string
  name: string
  arm: string
  academicSession: {
    id: string
    name: string
  }
}

interface Pagination {
  total: number
  limit: number
  page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface GroupedClassResponse {
  items: ClassItem[]
  pagination: Pagination
}

export const ClassesAPI = {
  getAll: (params?: { page?: number; limit?: number; includeArchived?: boolean; includeAllSessions?: boolean }) =>
    apiFetch<ResponsePack<GroupedClassResponse>>("/classes", { params }, true),

  create: (body: CreateClassData) =>
    apiFetch<ResponsePack<ClassItem>>("/classes", { method: "POST", data: body }, true),

  update: (id: string, body: UpdateClassData) =>
    apiFetch<ResponsePack<ClassItem>>(
      `/classes/${id}`,
      { method: "PATCH", data: body },
      true
    ),

  delete: (id: string) =>
    apiFetch<ResponsePack<null>>(`/classes/${id}`, { method: "DELETE" }, true),

  reactivate: (id: string) =>
    apiFetch<ResponsePack<null>>(`/classes/${id}/reactivate`, { method: "PATCH" }, true),

  getOne: (id: string) =>
    apiFetch<ResponsePack<SingleClass>>(`/classes/${id}`, { method: "GET" }, true),

  assignTeacherToClass: (teacherId: string, classId: string, sessionId?: string) =>
    apiFetch<
      ResponsePack<{
        message: string
        teacher_id: string
        class_id: string
        class_name: string
        assignment_date: string
      }>
    >(
      `/classes/teachers/${teacherId}/assign`,
      {
        method: "POST",
        data: { classId, sessionId },
      },
      true
    ),

  getClassesByTeacher: (teacherId: string, sessionId?: string) =>
    apiFetch<
      ResponsePack<
        {
          id: string
          name: string
          arm?: string
          academicSession?: {
            id: string
            name: string
          }
        }[]
      >
    >(
      `/classes/teacher/${teacherId}`,
      {
        method: "GET",
        params: sessionId ? { session_id: sessionId } : undefined,
      },
      true
    ),

  assignedTeachers: (id: string, session_id?: string) =>
    apiFetch<
      ResponsePack<
        {
          teacher_id: string
          name: string
          assignment_date: string
          streams: string
        }[]
      >
    >(`/classes/${id}/teachers`, { params: { session_id } }, true),

  getSubjectsForClass: (id: string) =>
    apiFetch<ResponsePack<ClassSubjectsResponse>>(
      `/class-subjects`,
      {
        method: "GET",
        params: { class_id: id },
      },
      true
    ),

  createSubjectsForClass: (id: string, subjectIds: string[]) =>
    apiFetch<ResponsePack<ClassSubjectsResponse>>(
      `/class-subjects`,
      {
        method: "POST",
        data: {
          classId: id,
          subjectIds: subjectIds,
        },
      },
      true
    ),

  assignTeachersToClassSubject: (classSubjectId: string, teacherId: string) =>
    apiFetch<ResponsePack<null>>(
      `/class-subjects/${classSubjectId}/teacher`,
      { method: "POST", data: { teacherId: teacherId } },
      true
    ),

  unassignTeachersFromClassSubject: (classSubjectId: string) =>
    apiFetch<ResponsePack<null>>(
      `/class-subjects/${classSubjectId}/teacher`,
      { method: "DELETE" },
      true
    ),

  getStudentsForClass: (classId: string) =>
    apiFetch<ResponsePack<StudentsForClass[]>>(
      `/classes/${classId}/students`,
      { method: "GET" },
      true
    ),

  addStudentsToClass: (classId: string, studentIds: string[]) =>
    apiFetch<ResponsePack<null>>(
      `/classes/${classId}/students`,
      { method: "POST", data: { studentIds } },
      true
    ),

  assignStudentToClass: (classId: string, studentId: string) =>
    apiFetch<ResponsePack<{ message: string }>>(
      `/classes/${classId}/students/${studentId}`,
      { method: "POST" },
      true
    ),

  removeStudentFromClass: (classId: string, studentId: string) => {
    return apiFetch<ResponsePack<null>>(
      `/classes/${classId}/students/${studentId}`,
      { method: "DELETE" },
      true
    )
  },

  count: () => apiFetch<ResponsePack<{ total: number }>>("/classes/count", {}, true),

  /** Promotion: preview which students will be promoted per arm mapping */
  promotionPreview: (body: {
    sourceSessionId: string
    targetSessionId: string
    armMappings: { sourceClassId: string; targetClassId: string }[]
  }) =>
    apiFetch<{
      message?: string
      data?: PromotionPreviewPayload
      sourceSessionId?: string
      targetSessionId?: string
      mappings?: PromotionMapping[]
      errors?: string[]
    }>("/classes/promotion/preview", { method: "POST", data: body }, true),

  /** Promotion: execute promotion */
  promotionExecute: (body: {
    sourceSessionId: string
    targetSessionId: string
    armMappings: { sourceClassId: string; targetClassId: string }[]
  }) =>
    apiFetch<{
      message?: string
      data?: PromotionExecutePayload
      promoted?: number
      skipped?: number
      failed?: number
      details?: { sourceClassId: string; targetClassId: string; promoted: number; skipped: number; failed: number }[]
    }>("/classes/promotion/execute", { method: "POST", data: body }, true),
}

export type PromotionMapping = {
  sourceClassId: string
  targetClassId: string
  sourceClassName: string
  targetClassName: string
  toPromote: number
  toPromoteStudentIds: string[]
  alreadyInTarget: number
  alreadyInTargetStudentIds: string[]
  errors: string[]
}

export type PromotionPreviewPayload = {
  sourceSessionId: string
  targetSessionId: string
  mappings: PromotionMapping[]
  errors: string[]
}

export type PromotionExecutePayload = {
  promoted: number
  skipped: number
  failed: number
  details: { sourceClassId: string; targetClassId: string; promoted: number; skipped: number; failed: number }[]
}

export type ClassSubjectsResponse = {
  payload: ClassSubject[]
  paginationMeta: {
    total: number
  }
}

export interface ClassSubject {
  id: string
  createdAt: string
  updatedAt: string
  teacher_assignment_date: string
  subject: Subject
  teacher: Teacher
}

export interface Subject {
  id: string
  createdAt: string
  updatedAt: string
  name: string
}

export interface Teacher {
  id: string
  createdAt: string
  updatedAt: string
  user_id: string
  employment_id: string
  title: string
  photo_url: string
  is_active: boolean
}

export interface StudentsForClass {
  student_id: string
  registration_number: string
  name: string
  enrollment_date: string // ISO timestamp
  is_active: boolean
}
