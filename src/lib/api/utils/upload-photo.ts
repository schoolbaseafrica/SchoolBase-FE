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
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, and WebP images are allowed.`)
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`)
  }

  const formData = new FormData()
  // Backend expects field name to be "file" (not the filename)
  formData.append("file", file)

  console.log("[upload-photo] Uploading file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    formDataHasFile: formData.has("file"),
  })

  return apiFetch<UploadApiResponse>(
    "/upload/picture",
    {
      method: "POST",
      // Don't set Content-Type header - browser/axios will set it automatically with boundary
      data: formData,
    },
    true
  ).catch((error: any) => {
    // Enhanced error logging to capture all possible error details
    // Try to extract response data in multiple ways since axios error structure can vary
    let responseData = error?.response?.data
    let responseStatus = error?.response?.status
    let responseStatusText = error?.response?.statusText
    
    // If response.data is a string, try to parse it as JSON
    if (typeof responseData === 'string' && responseData.length > 0) {
      try {
        responseData = JSON.parse(responseData)
      } catch {
        // If parsing fails, keep it as string
      }
    }
    
    const errorDetails = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      response: {
        status: responseStatus,
        statusText: responseStatusText,
        data: responseData,
        headers: error?.response?.headers ? Object.fromEntries(Object.entries(error.response.headers)) : undefined,
        rawData: typeof error?.response?.data === 'string' ? error.response.data.substring(0, 200) : error?.response?.data,
      },
      request: {
        url: error?.config?.url || error?.request?.responseURL,
        method: error?.config?.method,
        headers: error?.config?.headers ? Object.fromEntries(Object.entries(error.config.headers)) : undefined,
      },
      code: error?.code,
      isAxiosError: error?.isAxiosError,
    }
    
    console.error("[upload-photo] Upload failed - Full error details:", JSON.stringify(errorDetails, null, 2))
    
    // Extract backend error message if available (try multiple paths)
    const backendMessage = 
      (responseData && typeof responseData === 'object' && responseData.message) ||
      (responseData && typeof responseData === 'object' && responseData.error) ||
      (responseData && typeof responseData === 'object' && responseData.detail) ||
      (typeof responseData === 'string' && responseData) ||
      error?.message ||
      `Image upload failed (${responseStatus ? `Status: ${responseStatus}` : 'No response'})`
    
    // Create a more informative error
    const uploadError = new Error(backendMessage)
    ;(uploadError as any).statusCode = responseStatus
    ;(uploadError as any).responseData = responseData
    ;(uploadError as any).originalError = error
    throw uploadError
  })
}

export async function getPhotoUrl(file: File) {
  const response = await uploadToCloudinary(file)
  // Backend returns { status_code, message, data: { url, ... } }
  // apiFetch returns res.data, so response is already the API response object
  // Extract the nested data.url
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as UploadApiResponse).data.url
  }
  // Fallback: if response is already the nested data object
  return (response as any).url
}
