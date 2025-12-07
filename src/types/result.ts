export interface Student {
  id: string
  first_name: string
  last_name: string
  registration_number?: string
  class?: string
}

export interface Class {
  id: string
  name: string
  level?: string
  academic_session_id?: string
}

export interface Subject {
  id: string
  name: string
  code?: string
}

export interface Term {
  id: string
  name: string
  academic_year?: string
  is_active?: boolean
  start_date?: string
  end_date?: string
  status?: string
}

export interface Grade {
  id?: string
  student_id: string
  subject_id: string
  class_id: string
  term_id: string
  ca_score: number | null
  exam_score: number | null
  total_score: number | null
  grade: string | null
  comment?: string | null
  status?: "draft" | "submitted" | "approved" | "rejected"
  created_at?: string
  updated_at?: string
}

export interface GradeSubmission {
  id: string
  teacher_id: string
  teacher?: {
    id: string
    name: string
    title: string
  }
  class_id: string
  class?: {
    id: string
    name: string
    arm: string
  }
  subject_id: string
  subject?: {
    id: string
    name: string
  }
  term_id: string
  term?: {
    id: string
    name: string
  }
  academic_session_id: string
  grades: Grade[]
  status: "draft" | "submitted" | "approved" | "rejected"
  student_count?: number
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface GradingScale {
  grade: string
  min_score: number
  max_score: number
  remark: string
}

export interface GetGradesParams {
  class_id?: string
  subject_id?: string
  term_id?: string
  student_id?: string
  status?: string
  page?: number
  search?: string
  limit?: number
}
export interface GradeEntry {
  student_id: string
  ca_score: number | null
  exam_score: number | null
  total_score?: number | null
  grade?: string | null
  comment?: string | null
}

export interface CreateSubmissionRequest {
  class_id: string
  subject_id: string
  term_id: string
  academic_session_id?: string
  grades: GradeEntry[]
}

export interface SubmissionStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface ReviewActionRequest {
  reason?: string
  comment?: string
}

export interface ResultSubjectLine {
  id: string
  result_id: string
  subject_id: string
  subject_name?: string
  ca_score: number | null
  exam_score: number | null
  total_score: number | null
  grade_letter: string
  remark?: string | null
}

export interface StudentResult {
  id: string
  student_id: string
  class_id: string
  class_name?: string
  term_id: string
  term_name?: string
  academic_session_id: string
  academic_session_name?: string
  total_score: number
  average_score: number
  grade_letter: string
  position: number | null
  remark: string | null
  subject_count: number
  generated_at: string
  subjects: ResultSubjectLine[]
}

export interface ClassStatistics {
  highest_score: number
  lowest_score: number
  class_average: number
  total_students: number
}

export interface PaginatedResults {
  data: StudentResult[]
  meta: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface GenerateResultRequest {
  term_id: string
  academic_session_id?: string
  student_id?: string
  class_id?: string
}

export interface GenerateResultResponse {
  generated_count: number
  result_ids: string[]
}

// API Response types based on Swagger documentation
export interface ApiResponse<T> {
  status_code: number
  message: string
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface StudentBasicInfo {
  id: string
  registration_number: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  photo_url?: string
}

export interface ParentStudentsResponse {
  message: string
  status_code: number
  data: StudentBasicInfo[]
}

export interface StudentResultResponse {
  id: string
  student: {
    id: string
    name: string
    registration_number: string
  }
  class: {
    id: string
    name: string
    arm?: string
  }
  term: {
    id: string
    name: string
  }
  academicSession: {
    id: string
    name: string
    academicYear: string
  }
  total_score: number
  average_score: number
  grade_letter: string
  position: number | null
  remark: string | null
  subject_count: number
  subject_lines: Array<{
    id: string
    subject: {
      id: string
      name: string
    }
    ca_score: number
    exam_score: number
    total_score: number
    grade_letter: string
    remark: string | null
  }>
  generated_at: string
  created_at: string
  updated_at: string
}

// For student results endpoint response
export interface StudentResultsResponse {
  message: string
  data: StudentResultResponse[]
  meta?: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

// For class results endpoint response
export interface ClassResultsResponse {
  message: string
  data: {
    results: StudentResultResponse[]
    class_statistics: {
      highest_score: number
      lowest_score: number
      class_average: number
      total_students: number
    }
  }
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}
