import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { extractErrorMessage } from "../error-handler"

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

    // Log fee details API responses for debugging
    if (url.includes("/fees/student/")) {
      console.log("[apiFetch] Fee details API response:", {
        url,
        status: res.status,
        hasData: !!res.data,
        dataKeys: res.data ? Object.keys(res.data) : [],
        dataStructure: res.data
          ? {
              status_code: (res.data as any)?.status_code,
              message: (res.data as any)?.message,
              hasNestedData: !!(res.data as any)?.data,
              nestedDataKeys: (res.data as any)?.data
                ? Object.keys((res.data as any).data)
                : [],
              fullResponse: JSON.parse(JSON.stringify(res.data)), // Deep clone
            }
          : null,
      })
    }

    return res.data as TResponse
  } catch (err) {
    // Network or backend errors
    if (err instanceof AxiosError) {
      // if unauthed
      if (err.response?.status === 401) {
        navigateTo("/login")
      }
      // Skip logging for expected 404 empty states (e.g., "No students enrolled")
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        ""
      const isExpectedEmptyState =
        err.response?.status === 404 &&
        errorMsg.toLowerCase().includes("no students enrolled")

      // Log full error response for debugging (in development only)
      // Skip logging for expected empty states as they're handled gracefully
      if (
        process.env.NODE_ENV === "development" &&
        err.response &&
        err.response.data &&
        Object.keys(err.response.data).length > 0 &&
        !isExpectedEmptyState
      ) {
        // Log error data (this is the most useful info)
        console.error("API Error Data:", JSON.stringify(err.response.data, null, 2))

        // Optionally log additional response info if available
        const hasStatus = typeof err.response.status === "number"
        const hasStatusText =
          typeof err.response.statusText === "string" &&
          err.response.statusText.length > 0
        const hasUrl = typeof err.config?.url === "string" && err.config.url.length > 0

        if (hasStatus || hasStatusText || hasUrl) {
          const errorResponseInfo: Record<string, unknown> = {}
          if (hasStatus) errorResponseInfo.status = err.response.status
          if (hasStatusText) errorResponseInfo.statusText = err.response.statusText
          if (hasUrl && err.config) errorResponseInfo.url = err.config.url
          console.error("API Error Response:", errorResponseInfo)
        }
      }
      const errorMessage = extractErrorMessage(err)
      throw new Error(errorMessage)
    }
    throw new Error(extractErrorMessage(err))
  }
}
