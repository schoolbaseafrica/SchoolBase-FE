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

type Envelope<T> = T | { data: T }
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
  list: async (params?: {
    session_id?: string
    term_id?: string
    include_archived?: boolean
  }) => unwrap(await apiFetch<Envelope<Assignment[]>>("/assignments", { params })),
  get: async (id: string) =>
    unwrap(await apiFetch<Envelope<Assignment>>(`/assignments/${id}`)),
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
