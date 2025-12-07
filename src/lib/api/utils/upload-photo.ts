import { apiFetch } from "../client"

interface UploadFileResponse {
  url: string
  publicId: string
  originalName: string
  size: number
  mimetype: string
}

export function uploadToCloudinary(file: File) {
  const formData = new FormData()
  formData.append(file.name, file, file.name)

  return apiFetch<UploadFileResponse>(
    "/upload/picture",
    {
      method: "POST",
      headers: {
        "Content-Type": "multipart/formData",
      },
      data: formData,
    },
    true
  )
}

export async function getPhotoUrl(file: File) {
  const fileData = await uploadToCloudinary(file)
  return fileData.url
}
