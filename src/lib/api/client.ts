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

    return res.data as TResponse
  } catch (err) {
    // Network or backend errors
    if (err instanceof AxiosError) {
      // if unauthed
      if (err.response?.status === 401) {
        navigateTo("/login")
      }
      const errorMessage = extractErrorMessage(err)
      throw new Error(errorMessage)
    }
    throw new Error(extractErrorMessage(err))
  }
}
