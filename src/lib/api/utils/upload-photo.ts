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
  const formData = new FormData()
  // Backend expects field name to be "file" (not the filename)
  formData.append("file", file)

  return apiFetch<UploadApiResponse>(
    "/upload/picture",
    {
      method: "POST",
      // Don't set Content-Type header - browser will set it automatically with boundary
      data: formData,
    },
    true
  )
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
