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
    const errorDetails = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      response: {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        headers: error?.response?.headers,
      },
      request: {
        url: error?.config?.url,
        method: error?.config?.method,
        headers: error?.config?.headers,
      },
      code: error?.code,
    }
    
    console.error("[upload-photo] Upload failed - Full error details:", JSON.stringify(errorDetails, null, 2))
    
    // Extract backend error message if available
    const backendMessage = 
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      error?.message ||
      "Image upload failed"
    
    // Create a more informative error
    const uploadError = new Error(backendMessage)
    ;(uploadError as any).statusCode = error?.response?.status
    ;(uploadError as any).responseData = error?.response?.data
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
