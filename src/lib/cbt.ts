import { apiFetch } from "./api/client"

export type CbtExamStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "active"
  | "closed"
  | "published"
  | "archived"
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
  sectionId?: string | null
  sortOrder?: number
}

export interface CbtBlueprintRule {
  topic?: string
  type?: CbtQuestionType
  difficulty?: "easy" | "medium" | "hard"
  count: number
  sectionId?: string
}

export interface CbtBlueprintPreview {
  valid: boolean
  requested: number
  selected: number
  rules: Array<{
    ruleIndex: number
    requested: number
    available: number
    shortage: number
    sectionId: string | null
    questions: CbtQuestion[]
  }>
}

export interface CbtExamSection {
  id: string
  title: string
  instructions: string | null
  sortOrder: number
  questionLimit: number | null
}

export interface CbtAttemptSummary {
  id: string
  status: "in_progress" | "submitted"
  startedAt: string
  submittedAt: string | null
  resultPublishedAt?: string | null
  resultVisible?: boolean
  score?: number | null
  totalMarks?: number | null
  percentage?: number | null
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
  sections?: CbtExamSection[]
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
    sections?: Array<Pick<CbtExamSection, "id" | "title" | "instructions" | "sortOrder">>
  }
  questions: CbtQuestion[]
  answers?: CbtSavedAnswer[]
  result?: {
    score: number
    totalMarks: number
    percentage: number
    passed: boolean | null
    publishedAt: string | null
  } | null
}

export interface CbtExamAttempts {
  summary: {
    started: number
    expectedCandidates: number
    notStarted: number
    inProgress: number
    submitted: number
    pendingMarking: number
    published: number
    flagged: number
    averagePercent: number | null
    medianPercent: number | null
    highestPercent: number | null
    lowestPercent: number | null
    passRate: number | null
    completionRate: number
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
    resultPublishedAt: string | null
    studentId: string | null
    registrationNumber: string | null
    studentName: string
    answeredQuestions: number
    questionCount: number
    connectionLostCount: number
    visibilityHiddenCount: number
    lastEventAt: string | null
    applicantEmail: string | null
    deadlineAt: string
    connectionState: "online" | "offline"
  }>
  scoreDistribution: Array<{ label: string; count: number }>
  questionAnalytics: Array<{
    id: string
    body: string
    topic: string | null
    difficulty: string
    sectionTitle: string | null
    attemptCount: number
    answeredCount: number
    correctCount: number
    skippedCount: number
    incorrectCount: number
    correctRate: number | null
  }>
}

export interface CbtAttemptReview {
  id: string
  status: "in_progress" | "submitted"
  startedAt: string
  submittedAt: string | null
  candidate: {
    name: string
    email?: string
    registrationNumber?: string | null
    type: "student" | "applicant"
  }
  exam: { id: string; name: string; passMarkPercent: number | null }
  score: number
  totalMarks: number
  percentage: number
  manualGradingRequired: boolean
  gradingCompletedAt: string | null
  resultPublishedAt: string | null
  answers: Array<{
    id: string
    questionId: string
    response: { value?: unknown } | unknown
    isCorrect: boolean | null
    marksAwarded: number | null
    question: {
      body: string
      type: CbtQuestionType
      marks: number
      options: CbtQuestionOption[] | null
      correctAnswer: string | null
      explanation: string | null
    }
    grading: {
      graderId: string
      gradedAt: string
      comment: string | null
    } | null
  }>
  events: Array<{
    id: string
    eventType: string
    createdAt: string
    metadata: Record<string, unknown> | null
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
  sessionName: string
  termName: string | null
  attemptCount: number
  completedAttemptCount: number
  bestPercentage: number | null
  hasPassed: boolean
  latestExamName: string | null
  latestAttemptAt: string
  hasPendingMarking: boolean
  passMarkConfigured: boolean
}

export interface CbtApplicantDetail extends CbtApplicantSummary {
  intake: { id: string; name: string }
  period: { sessionName: string; termName: string | null }
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

  getAttemptReview: (attemptId: string) =>
    apiFetch<ApiEnvelope<CbtAttemptReview> | CbtAttemptReview>(
      `/cbt/attempts/${attemptId}/review`
    ).then(unwrap),

  gradeAttemptAnswer: (
    attemptId: string,
    questionId: string,
    data: { marksAwarded: number; comment?: string }
  ) =>
    apiFetch<ApiEnvelope<CbtAttemptReview> | CbtAttemptReview>(
      `/cbt/attempts/${attemptId}/answers/${questionId}/grade`,
      { method: "PATCH", data }
    ).then(unwrap),

  publishAttemptResult: (attemptId: string) =>
    apiFetch<ApiEnvelope<CbtAttemptReview> | CbtAttemptReview>(
      `/cbt/attempts/${attemptId}/publish-result`,
      { method: "POST" }
    ).then(unwrap),
  acknowledgeAttemptEvent: (eventId: string) =>
    apiFetch(`/cbt/attempt-events/${eventId}/acknowledge`, { method: "PATCH" }),

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

  transitionExam: (examId: string, status: CbtExamStatus) =>
    apiFetch<ApiEnvelope<CbtExamSummary> | CbtExamSummary>(
      `/cbt/exams/${examId}/status`,
      { method: "PATCH", data: { status } }
    ).then(unwrap),

  previewBlueprint: (examId: string, rules: CbtBlueprintRule[]) =>
    apiFetch<ApiEnvelope<CbtBlueprintPreview> | CbtBlueprintPreview>(
      `/cbt/exams/${examId}/blueprint/preview`,
      { method: "POST", data: { rules } }
    ).then(unwrap),

  applyBlueprint: (
    examId: string,
    selections: Array<{ questionId: string; sectionId?: string }>
  ) =>
    apiFetch(`/cbt/exams/${examId}/blueprint/apply`, {
      method: "POST",
      data: { selections },
    }).then(unwrap),

  addQuestion: (examId: string, data: Record<string, unknown>) =>
    apiFetch<ApiEnvelope<CbtQuestion> | CbtQuestion>(`/cbt/exams/${examId}/questions`, {
      method: "POST",
      data,
    }).then(unwrap),

  createSection: (examId: string, data: Record<string, unknown>) =>
    apiFetch(`/cbt/exams/${examId}/sections`, { method: "POST", data }).then(unwrap),

  listQuestionBank: (search?: string) =>
    apiFetch<ApiEnvelope<CbtQuestion[]> | CbtQuestion[]>("/cbt/question-bank", {
      params: { search: search || undefined },
    }).then(unwrap),

  saveQuestionToBank: (questionId: string) =>
    apiFetch<ApiEnvelope<CbtQuestion> | CbtQuestion>(
      `/cbt/questions/${questionId}/save-to-bank`,
      { method: "POST" }
    ).then(unwrap),

  importBankQuestion: (
    examId: string,
    questionId: string,
    data: { sectionId?: string; sortOrder?: number }
  ) =>
    apiFetch<ApiEnvelope<CbtQuestion> | CbtQuestion>(
      `/cbt/exams/${examId}/questions/import/${questionId}`,
      { method: "POST", data }
    ).then(unwrap),
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
