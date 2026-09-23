import { apiFetch } from "./api/client"

export type CbtExamStatus = "draft" | "published" | "archived"
export type CbtExamType = "in_school" | "entrance"
export type CbtProctoringMode = "none" | "human" | "recorded" | "both"
export type CbtQuestionType =
  | "mcq"
  | "multiple_response"
  | "true_false"
  | "short_answer"
  | "essay"

export interface CbtQuestionOption {
  id: string
  text: string
}

export interface CbtQuestion {
  id: string
  body: string
  type: CbtQuestionType
  options: CbtQuestionOption[] | null
  marks: string
  topic: string | null
  difficulty: "easy" | "medium" | "hard"
  correctAnswer?: string | null
  explanation?: string | null
}

export interface CbtAttemptSummary {
  id: string
  status: "in_progress" | "submitted"
  startedAt: string
  submittedAt: string | null
}

export interface CbtExamSummary {
  id: string
  name: string
  instructions: string | null
  status: CbtExamStatus
  examType: CbtExamType
  proctoringMode: CbtProctoringMode
  timeLimitMinutes: number
  maxAttempts: number
  availableFrom: string | null
  availableTo: string | null
  passMarkPercent: number | null
  questionCount?: number
  attempts?: CbtAttemptSummary[]
  questions?: CbtQuestion[]
  classes?: Array<{ id: string; name: string; arm?: string }>
}

export interface CbtSavedAnswer {
  id: string
  questionId: string
  answerData: { value: unknown }
  revision: number
  savedAt: string
}

export interface CbtAttempt {
  id: string
  status: "in_progress" | "submitted"
  startedAt: string
  deadline: string
  lastSavedAt: string | null
  exam: Pick<CbtExamSummary, "id" | "name" | "instructions" | "timeLimitMinutes"> & {
    shuffleOptions: boolean
  }
  questions: CbtQuestion[]
  answers?: CbtSavedAnswer[]
}

export interface CbtExamAttempts {
  summary: {
    started: number
    inProgress: number
    submitted: number
    averagePercent: number | null
  }
  attempts: Array<{
    id: string
    status: "in_progress" | "submitted"
    startedAt: string
    submittedAt: string | null
    lastSavedAt: string | null
    score: number | null
    totalMarks: number
    percentage: number | null
    manualGradingRequired: boolean
    studentId: string | null
    registrationNumber: string | null
    studentName: string
    answeredQuestions: number
  }>
}

export interface CbtApplicantSummary {
  id: string
  fullName: string
  email: string
  phone: string | null
  createdAt: string
  admittedAt: string | null
  studentId: string | null
  intakeName: string
  attemptCount: number
  completedAttemptCount: number
  bestPercentage: number | null
  hasPassed: boolean
  latestExamName: string | null
}

export interface CbtApplicantDetail extends CbtApplicantSummary {
  intake: { id: string; name: string }
  attempts: Array<{
    id: string
    status: "in_progress" | "submitted"
    score: number | null
    totalMarks: number
    percentage: number | null
    manualGradingRequired: boolean
    startedAt: string
    submittedAt: string | null
    exam: CbtExamSummary
  }>
}

export interface PublicCbtSession {
  accessToken: string
  candidate: { fullName: string; email: string }
  attempt: CbtAttempt
}

export interface CbtAdmissionResult {
  outcome: "student_profile_exists" | "linked_existing_student" | "student_invite_sent"
}

export interface CbtPeriodParams {
  sessionId?: string
  termId?: string
  scope?: "term" | "session"
}

type ApiEnvelope<T> = { data: T; message?: string; status_code?: number }

function unwrap<T>(response: ApiEnvelope<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data
  }
  return response as T
}

export const CbtAPI = {
  listStudentExams: (period?: CbtPeriodParams) =>
    apiFetch<ApiEnvelope<CbtExamSummary[]> | CbtExamSummary[]>("/cbt/student/exams", {
      params: period,
    }).then(unwrap),

  startAttempt: (examId: string) =>
    apiFetch<ApiEnvelope<CbtAttempt> | CbtAttempt>(
      `/cbt/student/exams/${examId}/attempts`,
      { method: "POST" }
    ).then(unwrap),

  getAttempt: (attemptId: string) =>
    apiFetch<ApiEnvelope<CbtAttempt> | CbtAttempt>(
      `/cbt/student/attempts/${attemptId}`
    ).then(unwrap),

  saveAnswer: (
    attemptId: string,
    questionId: string,
    answer: { value: unknown },
    revision: number
  ) =>
    apiFetch<ApiEnvelope<CbtSavedAnswer> | CbtSavedAnswer>(
      `/cbt/student/attempts/${attemptId}/answers/${questionId}`,
      { method: "PATCH", data: { answer, revision } }
    ).then(unwrap),

  submitAttempt: (attemptId: string) =>
    apiFetch(`/cbt/student/attempts/${attemptId}/submit`, { method: "POST" }),

  recordConnection: (
    attemptId: string,
    eventType: "connection_lost" | "connection_restored"
  ) =>
    apiFetch(`/cbt/student/attempts/${attemptId}/connection-events`, {
      method: "POST",
      data: { eventType },
    }),

  listExams: (examType?: CbtExamType, period?: CbtPeriodParams) =>
    apiFetch<ApiEnvelope<CbtExamSummary[]> | CbtExamSummary[]>("/cbt/exams", {
      params: { examType, ...period },
    }).then(unwrap),

  listApplicants: (period?: CbtPeriodParams) =>
    apiFetch<ApiEnvelope<CbtApplicantSummary[]> | CbtApplicantSummary[]>(
      "/cbt/applicants",
      { params: period }
    ).then(unwrap),
  getApplicant: (applicantId: string, period?: CbtPeriodParams) =>
    apiFetch<ApiEnvelope<CbtApplicantDetail> | CbtApplicantDetail>(
      `/cbt/applicants/${applicantId}`,
      { params: period }
    ).then(unwrap),
  admitApplicant: (applicantId: string, period?: CbtPeriodParams) =>
    apiFetch<ApiEnvelope<CbtAdmissionResult> | CbtAdmissionResult>(
      `/cbt/applicants/${applicantId}/admit`,
      { method: "POST", params: period }
    ).then(unwrap),

  getExam: (examId: string) =>
    apiFetch<ApiEnvelope<CbtExamSummary> | CbtExamSummary>(`/cbt/exams/${examId}`).then(
      unwrap
    ),

  getExamAttempts: (examId: string) =>
    apiFetch<ApiEnvelope<CbtExamAttempts> | CbtExamAttempts>(
      `/cbt/exams/${examId}/attempts`
    ).then(unwrap),

  createExam: (data: Record<string, unknown>) =>
    apiFetch<ApiEnvelope<CbtExamSummary> | CbtExamSummary>("/cbt/exams", {
      method: "POST",
      data,
    }).then(unwrap),

  publishExam: (examId: string) =>
    apiFetch<ApiEnvelope<CbtExamSummary> | CbtExamSummary>(
      `/cbt/exams/${examId}/publish`,
      {
        method: "POST",
      }
    ).then(unwrap),

  addQuestion: (examId: string, data: Record<string, unknown>) =>
    apiFetch<ApiEnvelope<CbtQuestion> | CbtQuestion>(`/cbt/exams/${examId}/questions`, {
      method: "POST",
      data,
    }).then(unwrap),
}

export const PublicCbtAPI = {
  listExams: () =>
    apiFetch<ApiEnvelope<CbtExamSummary[]> | CbtExamSummary[]>("/public/cbt/exams").then(
      unwrap
    ),
  getExam: (examId: string) =>
    apiFetch<ApiEnvelope<CbtExamSummary> | CbtExamSummary>(
      `/public/cbt/exams/${examId}`
    ).then(unwrap),
  startAttempt: (
    examId: string,
    candidate: { fullName: string; email: string; phone?: string }
  ) =>
    apiFetch<ApiEnvelope<PublicCbtSession> | PublicCbtSession>(
      `/public/cbt/exams/${examId}/attempts`,
      { method: "POST", data: candidate }
    ).then(unwrap),
  getAttempt: (attemptId: string, token: string) =>
    apiFetch<ApiEnvelope<CbtAttempt> | CbtAttempt>(`/public/cbt/attempts/${attemptId}`, {
      headers: { "X-CBT-Access-Token": token },
    }).then(unwrap),
  saveAnswer: (
    attemptId: string,
    questionId: string,
    token: string,
    answer: { value: unknown },
    revision: number
  ) =>
    apiFetch<ApiEnvelope<CbtSavedAnswer> | CbtSavedAnswer>(
      `/public/cbt/attempts/${attemptId}/answers/${questionId}`,
      {
        method: "PATCH",
        headers: { "X-CBT-Access-Token": token },
        data: { answer, revision },
      }
    ).then(unwrap),
  recordEvent: (
    attemptId: string,
    token: string,
    eventType:
      | "connection_lost"
      | "connection_restored"
      | "visibility_hidden"
      | "visibility_visible"
  ) =>
    apiFetch(`/public/cbt/attempts/${attemptId}/events`, {
      method: "POST",
      headers: { "X-CBT-Access-Token": token },
      data: { eventType },
    }),
  submitAttempt: (attemptId: string, token: string) =>
    apiFetch(`/public/cbt/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "X-CBT-Access-Token": token },
    }),
}
