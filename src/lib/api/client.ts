import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { getUserFriendlyMessage } from "../errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const isAbsoluteUrl = (path: string): boolean => /^https?:\/\//i.test(path)
const isInternalApiPath = (path: string): boolean => path.startsWith("/api/")
const normalizeBackendPath = (path: string): string => {
  const trimmedBase = API_BASE_URL?.replace(/\/+$/, "") ?? ""
  const trimmedPath = path.replace(/^\/+/, "")

  return `${trimmedBase}/${trimmedPath}`
}

const resolveRequestUrl = (path: string, proxy?: boolean): string => {
  if (isAbsoluteUrl(path) || isInternalApiPath(path)) {
    return path
  }

  if (proxy) {
    return `/api/proxy-auth${path.startsWith("/") ? path : "/" + path}`
  }

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
  }

  return normalizeBackendPath(path)
}

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 400,
})

const navigateTo = (path: string) => {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    window.location.href = path
  }
}

const getErrorMessage = (error: unknown): string => {
  const defaultMessage = "An unexpected error occurred. Please try again later."

  if (error instanceof AxiosError) {
    const responseData = error.response?.data

    // Try to extract the actual error message from backend response
    if (typeof responseData === "object" && responseData !== null) {
      // Check for nested message structure
      const message = responseData.message || responseData.error || responseData.detail

      if (message) {
        if (typeof message === "string") {
          if (
            message.toLowerCase().includes("email already exists") ||
            message.toLowerCase().includes("email already exist")
          ) {
            return "Email address already exists. Please use a different email."
          }
          if (
            message.toLowerCase().includes("registration number") &&
            message.toLowerCase().includes("already exists")
          ) {
            return "Registration number already exists."
          }
          if (message.toLowerCase().includes("invalid credentials")) {
            return "Invalid Email address and/or Password."
          }
          // check if it is a proxy
          if (message.toLowerCase().includes("proxy error")) {
            return "Network error! please check your connection and try again"
          }

          return message
        }

        // Handle array of validation errors
        if (Array.isArray(message)) {
          return message[0] || defaultMessage
        }
      }

      // Check for validation errors in nested structure
      if (
        responseData.errors &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length > 0
      ) {
        const firstError = responseData.errors[0]
        if (typeof firstError === "string") return firstError
        if (typeof firstError?.msg === "string") return firstError.msg
        return defaultMessage
      }
    }

    // if (error.response?.status === 409) {
    //   return "An account with these details already exists."
    // }

    if (error.response?.status === 400) {
      return "Invalid input data. Please check your entries."
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname
        if (
          !pathname.includes("/login") &&
          pathname.startsWith("/") &&
          !pathname.startsWith("//")
        ) {
          navigateTo(`/login?next=${encodeURIComponent(pathname)}`)
        }
      }
      return "Your session has expired. Please log in again."
    }

    // Fix the type error by providing default values
    const statusText = error.response?.statusText || "Unknown Error"
    const status = error.response?.status || 500
    return getUserFriendlyMessage(statusText, status)
  }

  return defaultMessage
}

export async function apiFetch<TResponse>(
  path: string,
  config: AxiosRequestConfig = {},
  proxy?: boolean
): Promise<TResponse> {
  const headers = { ...(config.headers || {}) }

  // Only set JSON header for plain objects/strings
  const isJson =
    config.data && !(config.data instanceof FormData) && !(config.data instanceof Blob)

  if (!headers["Content-Type"] && isJson) {
    headers["Content-Type"] = "application/json"
  }

  const axiosInstance = proxy ? axios : api
  const url = resolveRequestUrl(path, proxy)

  try {
    const res = await axiosInstance.request({
      url,
      ...config,
      headers,
    })

    // Handle 204 No Content (common for DELETE requests)
    if (res.status === 204) {
      return undefined as TResponse
    }

    return res.data as TResponse
  } catch (err) {
    // Network or backend errors
    if (err instanceof AxiosError) {
      // if unauthed
      if (err.response?.status === 401) {
        navigateTo("/login")
      }
      const errorMessage = getErrorMessage(err)
      throw new Error(errorMessage)
    }
    throw new Error("An unexpected error occured. Please try again later")
  }
}
