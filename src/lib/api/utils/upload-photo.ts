import { apiFetch } from "../client"

interface UploadFileResponse {
  url: string
  publicId: string
  originalName: string
  size: number
  mimetype: string
}

const getUploadKey = () => process.env.NEXT_PUBLIC_UPLOAD_KEY

export function uploadPicture(file: File) {
  const formData = new FormData()
  formData.append("file", file, file.name)

  return apiFetch<UploadFileResponse>(
    "/upload/picture",
    {
      method: "POST",
      headers: {
        ...(getUploadKey() ? { "x-upload-key": getUploadKey() as string } : {}),
      },
      data: formData,
    },
    true
  )
}

export async function getPhotoUrl(file: File) {
  const fileData = await uploadPicture(file)
  return fileData.url
}
