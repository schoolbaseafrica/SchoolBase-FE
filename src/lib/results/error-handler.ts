// @/lib/results/error-handler.ts

export interface ResultsApiError {
  status_code: number
  message: string
  error: string
  data: null
  timestamp: string
  path: string
  method: string
}

// Type guard to check if error is a ResultsApiError
export const isResultsApiError = (error: unknown): error is ResultsApiError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "status_code" in error &&
    "message" in error &&
    "error" in error
  )
}

// Extract error message specifically for results operations
export const getResultsErrorMessage = (error: unknown): string => {
  // Handle ResultsApiError format (from backend)
  if (isResultsApiError(error)) {
    switch (error.status_code) {
      case 403:
        return (
          error.message || "You are not assigned to teach this subject for this class"
        )
      case 401:
        return "Your session has expired. Please login again."
      case 400:
        // Check for specific validation messages
        if (
          error.message.toLowerCase().includes("score") ||
          error.message.toLowerCase().includes("grade")
        ) {
          return error.message
        }
        return "Invalid data submitted. Please check your entries."
      case 404:
        return "Resource not found"
      case 409:
        return "This grade entry already exists or conflicts with existing data."
      case 422:
        return "Validation error. Please check all fields are correct."
      default:
        return error.message || "An error occurred while processing grades"
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()

    // Check for specific error patterns
    if (
      errorMessage.includes("not assigned") ||
      errorMessage.includes("not assigned to teach") ||
      errorMessage.includes("are not assigned")
    ) {
      return error.message
    }

    if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      return "Network error. Please check your connection and try again."
    }

    if (errorMessage.includes("token") || errorMessage.includes("auth")) {
      return "Authentication error. Please login again."
    }

    return error.message
  }

  // Generic fallback
  return "An unexpected error occurred. Please try again."
}

// Helper to validate grade scores
export const validateGradeScores = (
  caScore: number | null,
  examScore: number | null
): string | null => {
  if (caScore !== null && (caScore < 0 || caScore > 30)) {
    return "CA score must be between 0 and 30"
  }

  if (examScore !== null && (examScore < 0 || examScore > 70)) {
    return "Exam score must be between 0 and 70"
  }

  return null
}

// Validate a batch of grades
export const validateAllGradeScores = (
  grades: Array<{ ca_score: number | null; exam_score: number | null }>
): string | null => {
  for (const grade of grades) {
    const error = validateGradeScores(grade.ca_score, grade.exam_score)
    if (error) return error
  }
  return null
}
