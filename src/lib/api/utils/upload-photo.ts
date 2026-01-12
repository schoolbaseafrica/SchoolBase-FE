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
  ).catch((error) => {
    console.error("[upload-photo] Upload failed:", {
      error,
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
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
