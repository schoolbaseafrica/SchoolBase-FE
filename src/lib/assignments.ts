import { apiFetch } from "./api/client"

export type AssignmentStatus = "draft" | "published" | "closed" | "archived"
export type SubmissionStatus = "draft" | "submitted" | "graded" | "returned"

export interface AssignmentSubmission {
  id: string
  responseText: string | null
  attachmentUrl: string | null
  status: SubmissionStatus
  submittedAt: string | null
  isLate: boolean
  marksAwarded: number | null
  feedback: string | null
  gradedAt: string | null
  student: {
    id: string
    registration_number: string
    user?: { first_name?: string; last_name?: string }
  }
}

export interface AssignmentAttachment {
  id: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy: string
  student: null | {
    id: string
    registration_number: string
    user?: { first_name?: string; last_name?: string }
  }
}

export interface Assignment {
  id: string
  title: string
  instructions: string
  attachmentUrl: string | null
  dueAt: string | null
  totalMarks: number
  status: AssignmentStatus
  publishedAt: string | null
  createdAt: string
  classroom: { id: string; name: string; arm?: string }
  subject: { id: string; name: string }
  teacher: {
    id: string
    title?: string
    user?: { first_name?: string; last_name?: string }
  }
  academicSession: { id: string; name: string }
  academicTerm: { id: string; name: string } | null
  submissions: AssignmentSubmission[]
}

export interface AssignmentReport {
  summary: {
    total: number
    missing: number
    submitted: number
    late: number
    graded: number
    averagePercentage: number | null
  }
  rows: Array<{
    assignmentId: string
    assignment: string
    className: string
    subject: string
    dueAt: string | null
    studentId: string
    student: string
    registrationNumber: string
    status: string
    submittedAt: string | null
    marksAwarded: number | null
    totalMarks: number
  }>
}

type Envelope<T> = T | { data: T }
type AssignmentSubjectOption = { id: string; name: string }
const unwrap = <T>(value: Envelope<T>): T =>
  value && typeof value === "object" && "data" in value ? value.data : value

export interface CreateAssignmentInput {
  title: string
  instructions: string
  classId: string
  subjectId: string
  academicSessionId: string
  academicTermId?: string
  dueAt?: string
  totalMarks?: number
  attachmentUrl?: string
}

export const AssignmentAPI = {
  teacherSubjects: async (classId: string) =>
    unwrap(
      await apiFetch<Envelope<AssignmentSubjectOption[]>>(
        "/assignments/options/subjects",
        {
          params: { class_id: classId },
        }
      )
    ),
  attachments: async (assignmentId: string, studentId?: string) =>
    unwrap(
      await apiFetch<Envelope<AssignmentAttachment[]>>(
        `/assignments/${assignmentId}/attachments`,
        { params: { student_id: studentId } }
      )
    ),
  uploadAttachment: async (
    assignmentId: string,
    file: File,
    onProgress?: (percent: number) => void
  ) => {
    const data = new FormData()
    data.append("file", file)
    return unwrap(
      await apiFetch<Envelope<AssignmentAttachment>>(
        `/assignments/${assignmentId}/attachments`,
        {
          method: "POST",
          data,
          onUploadProgress: (event) =>
            onProgress?.(
              event.total ? Math.round((event.loaded / event.total) * 100) : 0
            ),
        }
      )
    )
  },
  deleteAttachment: (assignmentId: string, attachmentId: string) =>
    apiFetch(`/assignments/${assignmentId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
  attachmentDownloadUrl: (
    assignmentId: string,
    attachmentId: string,
    studentId?: string
  ) =>
    `/api/proxy-auth/assignments/${assignmentId}/attachments/${attachmentId}/download${studentId ? `?student_id=${encodeURIComponent(studentId)}` : ""}`,
  list: async (params?: {
    session_id?: string
    term_id?: string
    include_archived?: boolean
  }) => unwrap(await apiFetch<Envelope<Assignment[]>>("/assignments", { params })),
  get: async (id: string) =>
    unwrap(await apiFetch<Envelope<Assignment>>(`/assignments/${id}`)),
  parentList: async (
    studentId: string,
    params?: { session_id?: string; term_id?: string }
  ) =>
    unwrap(
      await apiFetch<Envelope<Assignment[]>>(`/assignments/parent/${studentId}`, {
        params,
      })
    ),
  report: async (params?: {
    session_id?: string
    term_id?: string
    class_id?: string
    subject_id?: string
    status?: string
  }) =>
    unwrap(
      await apiFetch<Envelope<AssignmentReport>>("/assignments/reports/class-work", {
        params,
      })
    ),
  create: async (data: CreateAssignmentInput) =>
    unwrap(
      await apiFetch<Envelope<Assignment>>("/assignments", { method: "POST", data })
    ),
  update: async (id: string, data: Partial<CreateAssignmentInput>) =>
    unwrap(
      await apiFetch<Envelope<Assignment>>(`/assignments/${id}`, {
        method: "PATCH",
        data,
      })
    ),
  transition: async (id: string, status: AssignmentStatus) =>
    unwrap(
      await apiFetch<Envelope<Assignment>>(`/assignments/${id}/status`, {
        method: "PATCH",
        data: { status },
      })
    ),
  saveSubmission: async (
    id: string,
    data: { responseText?: string; attachmentUrl?: string; status: "draft" | "submitted" }
  ) =>
    unwrap(
      await apiFetch<Envelope<AssignmentSubmission>>(`/assignments/${id}/submission`, {
        method: "POST",
        data,
      })
    ),
  grade: async (
    assignmentId: string,
    submissionId: string,
    data: { marksAwarded: number; feedback?: string; status?: "graded" | "returned" }
  ) =>
    unwrap(
      await apiFetch<Envelope<AssignmentSubmission>>(
        `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        { method: "PATCH", data }
      )
    ),
}
