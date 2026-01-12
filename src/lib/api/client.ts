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
  // Absolute URLs are always returned as-is
  if (isAbsoluteUrl(path)) {
    return path
  }

  if (proxy) {
    // For proxy requests, normalize the path even if it starts with /api/
    // (unless it's a true internal Next.js API route like /api/config)
    // Normalize path: remove leading slashes and /api/v1 if present
    // (proxy-auth route will add /api/v1 back)
    let normalizedPath = path.replace(/^\/+/, "")
    // Remove /api/v1 prefix if present (proxy will add it back)
    normalizedPath = normalizedPath.replace(/^api\/v1\/?/, "")
    // Also handle if path already starts with /api/v1/
    normalizedPath = normalizedPath.replace(/^api\/v1\/?/, "")
    return `/api/proxy-auth/${normalizedPath}`
  }

  // For non-proxy requests, internal API paths are returned as-is
  if (isInternalApiPath(path)) {
    return path
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
  // Ensure error responses are properly parsed
  transformResponse: [(data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch {
        return data
      }
    }
    return data
  }],
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

  const url = resolveRequestUrl(path, proxy)
  
  // Use plain axios (no baseURL) for:
  // 1. Proxy requests (go to Next.js proxy routes)
  // 2. Internal Next.js API routes (paths starting with /api/)
  // Use api instance (with baseURL) for direct backend requests
  const axiosInstance = proxy || isInternalApiPath(url) ? axios : api

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
      // Always log error details for upload requests to help debug
      const isUploadRequest = err.config?.url?.includes('/upload') || err.config?.method === 'POST' && err.config?.data instanceof FormData
      if (isUploadRequest) {
        console.error('[apiFetch] Upload error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          dataType: typeof err.response?.data,
          dataString: typeof err.response?.data === 'string' ? err.response.data.substring(0, 500) : undefined,
          headers: err.response?.headers ? Object.fromEntries(Object.entries(err.response.headers)) : undefined,
          url: err.config?.url,
          method: err.config?.method,
        })
      }
      // Check if school exists before redirecting to login
      // If school doesn't exist, redirect to setup instead
      if (err.response?.status === 401 || err.response?.status === 409) {
        // Check if this is a "School not found" error
        const errorMessage = err.response?.data?.message || ""
        const isSchoolNotFound = errorMessage.toLowerCase().includes("school not found")

        // Also check if the request was to the /school endpoint and got 409
        const isSchoolEndpoint =
          err.config?.url?.includes("/school") && err.response?.status === 409

        if (isSchoolNotFound || isSchoolEndpoint) {
          // School doesn't exist - redirect to setup
          navigateTo("/setup")
          return {} as TResponse // Return empty object to prevent further processing
        }

        // For 401 errors, check if we're on a super admin route and redirect accordingly
        if (err.response?.status === 401) {
          const isSuperAdminRoute =
            typeof window !== "undefined" &&
            window.location.pathname.startsWith("/super-admin")
          navigateTo(isSuperAdminRoute ? "/super-admin/login" : "/login")
        }
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
