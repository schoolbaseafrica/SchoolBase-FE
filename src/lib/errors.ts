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

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Get a structured error object for easy inspection
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      code: this.code,
      originalMessage: this.originalMessage,
      details: this.details,
    }
  }
}

/**
 * Check if an error is an ApiError instance or serialized ApiError
 */
export function isApiError(error: unknown): error is ApiError | ApiErrorShape {
  if (error instanceof ApiError) {
    return true
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "userMessage" in error &&
    typeof (error as { userMessage: unknown }).userMessage === "string"
  ) {
    return true
  }

  return false
}

/**
 * Shape of serialized ApiError
 */
interface ApiErrorShape {
  name?: string
  message?: string
  userMessage: string
  statusCode?: number
  code?: string
  originalMessage?: string
  details?: unknown
}

/**
 * Extract user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage
  }

  if (isApiError(error)) {
    const apiError = error as ApiErrorShape
    return apiError.userMessage
  }

  let message: string | undefined

  if (error instanceof Error) {
    message = error.message
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    message = (error as { message: string }).message
  } else {
    message = String(error) || "Something unexpected happened"
  }

  const contextMatch = message.match(/^\[.*?\]\s*(.+)$/)
  if (contextMatch) {
    const actualMessage = contextMatch[1].trim()
    return getUserFriendlyMessage(actualMessage)
  }

  return getUserFriendlyMessage(message)
}

/**
 * Maps backend error messages to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  "An internal server error occurred":
    "We're experiencing some technical difficulties. Please try again in a few moments.",
  "Internal server error":
    "We're experiencing some technical difficulties. Please try again in a few moments.",
  "Internal Server Error":
    "We're experiencing some technical difficulties. Please try again in a few moments.",
  "Network error: Could not reach the server.":
    "Unable to connect to the server. Please check your internet connection and try again.",
  "Unknown error": "Something unexpected happened. Please try again.",
  timeout: "The request took too long to complete. Please try again.",
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
const STATUS_CODE_MAP: Record<number, string> = {
  400: "The request was invalid. Please check your input and try again.",
  401: "You're not authorized to perform this action. Please log in and try again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data. Please check and try again.",
  422: "The information provided is invalid. Please check your input and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "We're experiencing some technical difficulties. Please try again in a few moments.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "The service is temporarily unavailable. Please try again later.",
  504: "The request took too long to complete. Please try again.",
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(
  originalMessage: string,
  statusCode?: number
): string {
  const normalizedMessage = originalMessage.trim()
  if (ERROR_MESSAGE_MAP[normalizedMessage]) {
    return ERROR_MESSAGE_MAP[normalizedMessage]
  }

  const lowerMessage = normalizedMessage.toLowerCase()
  for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value
    }
  }

  if (statusCode && STATUS_CODE_MAP[statusCode]) {
    return STATUS_CODE_MAP[statusCode]
  }

  return originalMessage
}

/**
 * Create an ApiError from an Axios error or other error
 */
export function createApiError(error: unknown, context?: string): ApiError {
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const axiosError = error as {
      response?: { status: number; data?: unknown; statusText?: string }
      request?: unknown
      message?: string
      code?: string
    }

    if (axiosError.response) {
      const statusCode = axiosError.response.status
      const responseData = axiosError.response.data

      const errorMessage =
        (typeof responseData === "object" &&
          responseData !== null &&
          ("message" in responseData
            ? String(responseData.message)
            : "error" in responseData
              ? String(responseData.error)
              : undefined)) ||
        axiosError.response.statusText ||
        axiosError.message ||
        "Unknown error occurred"

      const userMessage = getUserFriendlyMessage(errorMessage, statusCode)

      return new ApiError({
        message: context ? `[${context}] ${errorMessage}` : errorMessage,
        statusCode,
        originalMessage: errorMessage,
        userMessage,
        code: axiosError.code,
        details: responseData,
      })
    }

    if (axiosError.request) {
      const userMessage = getUserFriendlyMessage(
        "Network error: Could not reach the server."
      )
      return new ApiError({
        message: "Network error: Could not reach the server.",
        originalMessage: axiosError.message || "Network error",
        userMessage,
        code: axiosError.code || "NETWORK_ERROR",
        details: { request: axiosError.request },
      })
    }
  }

  if (error instanceof Error) {
    const userMessage = getUserFriendlyMessage(error.message)
    return new ApiError({
      message: context ? `[${context}] ${error.message}` : error.message,
      originalMessage: error.message,
      userMessage,
    })
  }

  const errorMessage = String(error) || "An unexpected error occurred"
  const userMessage = getUserFriendlyMessage(errorMessage)
  return new ApiError({
    message: context ? `[${context}] ${errorMessage}` : errorMessage,
    originalMessage: errorMessage,
    userMessage,
    details: error,
  })
}
