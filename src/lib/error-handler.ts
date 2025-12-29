import { AxiosError } from "axios"

/**
 * Standardized API Error class with consistent structure
 */

export class ApiError extends Error {
  public readonly statusCode?: number
  public readonly code?: string
  public readonly originalMessage?: string
  public readonly userMessage: string
  public readonly details?: unknown

  constructor({
    message,
    statusCode,
    code,
    originalMessage,
    userMessage,
    details,
  }: {
    message: string
    statusCode?: number
    code?: string
    originalMessage?: string
    userMessage: string
    details?: unknown
  }) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
    this.originalMessage = originalMessage
    this.userMessage = userMessage
    this.details = details
  }
}

type ApiErrorShape = {
  userMessage?: string
  message?: string
}

function isApiError(error: unknown): error is ApiError | ApiErrorShape {
  if (error instanceof ApiError) return true

  if (
    typeof error === "object" &&
    error !== null &&
    "userMessage" in error &&
    typeof (error as { userMessage?: unknown }).userMessage === "string"
  ) {
    return true
  }

  return false
}

interface ApiErrorResponse {
  message?: string | string[]
  error?: string
  detail?: string
  errors?: Array<{ field?: string; msg: string } | string>
  statusCode?: number
  stack?: string
}

/**
 * Extract error message from API response
 * Priority: Backend message > Validation errors > Status fallback
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage ?? error.message
  }

  // Serialized ApiError shape
  if (isApiError(error)) {
    const apiError = error as { userMessage?: string; message?: string }
    return (
      apiError.userMessage ?? apiError.message ?? "An error occurred. Please try again."
    )
  }

  // Handle AxiosError
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    // Check for SMTP/email configuration errors
    if (
      data?.error === "ESOCKET" ||
      data?.stack?.includes("127.0.0.1:587") ||
      data?.stack?.includes("ECONNREFUSED")
    ) {
      return "Email service is not configured. Please configure SMTP settings in your environment variables. The account has been created successfully, but the welcome email could not be sent."
    }

    // Priority 1: Backend message (can be string or array of strings for validation errors)
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join("; ")
      }
      if (typeof data.message === "string") {
        // Check if the message is misleading and relates to email issues
        if (
          data.message.toLowerCase().includes("database operation failed") &&
          (data.error === "ESOCKET" || data?.stack?.includes("587"))
        ) {
          return "Email service is not configured. Please configure SMTP settings. The account may have been created successfully, but the welcome email could not be sent."
        }
        return data.message
      }
    }

    if (data?.error && typeof data.error === "string") {
      return data.error
    }

    if (data?.detail && typeof data.detail === "string") {
      return data.detail
    }

    // Priority 2: Validation errors array (NestJS format: { errors: [...] })
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((err) => {
          if (typeof err === "string") return err
          if (err && typeof err === "object") {
            const errorObj = err as { field?: string; msg?: string; message?: string }
            if (errorObj.field && errorObj.msg) {
              return `${errorObj.field}: ${errorObj.msg}`
            }
            return errorObj.msg || errorObj.message || String(err)
          }
          return String(err)
        })
        .join("; ")
    }

    // Priority 3: Status-based fallback
    return getStatusMessage(error.response?.status)
  }

  // Handle generic Error
  if (error instanceof Error) {
    return error.message
  }

  // Fallback
  return "An error occurred. Please try again."
}

function getStatusMessage(status?: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Session expired. Please log in again.",
    403: "You do not have permission for this action.",
    404: "Resource not found.",
    409: "This action conflicts with existing data.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable.",
    503: "Service temporarily unavailable.",
    504: "Request timeout. Please try again.",
  }

  return messages[status || 500] || "An error occurred. Please try again."
}

/**
 * Handle error without side effects (no toast, no console).
 * Returns the extracted message so callers can choose how to display/log.
 */
export function handleError(error: unknown, context?: string): string {
  const message = extractErrorMessage(error)
  const displayMessage = context ? `${context}: ${message}` : message
  return displayMessage
}

/**
 * Create feature-specific error handler
 */
export function createErrorHandler(feature: string) {
  return {
    handle: (error: unknown, action?: string) => {
      const context = action ? `${feature} - ${action}` : feature
      return handleError(error, context)
    },

    extract: extractErrorMessage,
  }
}
