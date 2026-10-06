import { apiFetch } from "../client"

interface UploadFileResponse {
  url: string
  publicId: string
  originalName: string
  size: number
  mimetype: string
}

interface UploadApiResponse {
  status_code: number
  message: string
  data: UploadFileResponse
}

export function uploadToCloudinary(file: File) {
  // Validate file before upload
  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP images are allowed.`
    )
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`
    )
  }

  const formData = new FormData()
  // Backend expects field name to be "file" (not the filename)
  formData.append("file", file)

  return apiFetch<UploadApiResponse>(
    "/upload/picture",
    {
      method: "POST",
      // Don't set Content-Type header - browser/axios will set it automatically with boundary
      data: formData,
    },
    true
  ).catch((error: unknown) => {
    const failure = error as {
      response?: { data?: unknown; status?: number }
      message?: string
    }
    let responseData = failure?.response?.data
    const responseStatus = failure?.response?.status

    // If response.data is a string, try to parse it as JSON
    if (typeof responseData === "string" && responseData.length > 0) {
      try {
        responseData = JSON.parse(responseData)
      } catch {
        // If parsing fails, keep it as string
      }
    }

    // Extract backend error message if available (try multiple paths)
    const details =
      responseData && typeof responseData === "object"
        ? (responseData as Record<string, unknown>)
        : null
    const backendMessage =
      [
        details?.message,
        details?.error,
        details?.detail,
        responseData,
        failure?.message,
      ].find((value): value is string => typeof value === "string" && value.length > 0) ||
      `Image upload failed (${responseStatus ? `Status: ${responseStatus}` : "No response"})`

    // Create a more informative error
    const uploadError = new Error(backendMessage)
    ;(uploadError as Error & { statusCode?: number }).statusCode = responseStatus
    throw uploadError
  })
}

export async function getPhotoUrl(file: File) {
  const response = await uploadToCloudinary(file)
  // Backend returns { status_code, message, data: { url, ... } }
  // apiFetch returns res.data, so response is already the API response object
  // Extract the nested data.url
  if (response && typeof response === "object" && "data" in response) {
    return (response as UploadApiResponse).data.url
  }
  // Fallback: if response is already the nested data object
  return (response as unknown as UploadFileResponse).url
}
