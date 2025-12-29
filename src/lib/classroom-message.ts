import { apiFetch } from "./api/client"

export interface ClassroomMessage {
  id: string
  class_id: string
  sender_type: "teacher" | "student"
  sender_id: string
  text: string | null
  audio_url: string | null
  audio_duration: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateMessageData {
  class_id: string
  sender_type?: "teacher" | "student"
  sender_id?: string
  text?: string
  audio_url?: string
  audio_duration?: number
}

export interface UploadAudioResponse {
  url: string
  publicId: string
  originalName: string
  size: number
  mimetype: string
}

type ResponsePack<T> = {
  data: T
  message?: string
  status_code?: number
}

export const ClassroomMessageAPI = {
  /**
   * Get all messages for a class
   */
  getByClass: (classId: string): Promise<ClassroomMessage[]> => {
    return apiFetch<ResponsePack<ClassroomMessage[]>>(
      `/classroom-messages/class/${classId}`,
      {
        method: "GET",
      },
      true
    ).then((response) => {
      // Handle wrapped response
      if (response && typeof response === "object" && "data" in response) {
        return (response as ResponsePack<ClassroomMessage[]>).data
      }
      return response as ClassroomMessage[]
    })
  },

  /**
   * Create a new message
   */
  create: (data: CreateMessageData): Promise<ClassroomMessage> => {
    return apiFetch<ResponsePack<ClassroomMessage>>(
      "/classroom-messages",
      {
        method: "POST",
        data,
      },
      true
    ).then((response) => {
      // Handle wrapped response
      if (response && typeof response === "object" && "data" in response) {
        return (response as ResponsePack<ClassroomMessage>).data
      }
      return response as ClassroomMessage
    })
  },

  /**
   * Upload audio file
   */
  uploadAudio: (file: File): Promise<UploadAudioResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    // For FormData, we need to use axios directly with proxy and let it handle Content-Type
    // Don't set Content-Type header - browser will set it with boundary
    return apiFetch<ResponsePack<UploadAudioResponse>>(
      "/upload/audio",
      {
        method: "POST",
        data: formData,
        // Don't set Content-Type - let browser/axios handle it for FormData
        headers: {
          // Explicitly remove Content-Type to let FormData set it with boundary
        },
      },
      true
    ).then((response) => {
      // Handle wrapped response
      if (response && typeof response === "object" && "data" in response) {
        return (response as ResponsePack<UploadAudioResponse>).data
      }
      return response as UploadAudioResponse
    })
  },
}
