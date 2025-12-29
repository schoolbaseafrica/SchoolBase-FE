import { apiFetch } from "./api/client"

export interface MediaPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface TextBoxData {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
}

export interface WhiteboardResponse {
  id: string | null
  class_id: string
  canvas_state: string | null
  images_data: Record<string, MediaPosition>
  videos_data: Record<string, MediaPosition>
  text_boxes: TextBoxData[]
  is_active: boolean
  allow_student_edit: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UpdateWhiteboardData {
  canvas_state?: string | null
  images_data?: Record<string, MediaPosition>
  videos_data?: Record<string, MediaPosition>
  text_boxes?: TextBoxData[]
}

type ResponsePack<T> = {
  status_code: number
  message: string | null
  data: T
}

export const WhiteboardAPI = {
  /**
   * Get whiteboard for a class
   */
  getByClass: (classId: string): Promise<WhiteboardResponse> => {
    return apiFetch<ResponsePack<WhiteboardResponse> | WhiteboardResponse>(
      `/whiteboards/class/${classId}`,
      { method: "GET" },
      true
    ).then((response) => {
      console.log("[WhiteboardAPI.getByClass] Raw API response:", response)

      // Handle wrapped response
      let data: WhiteboardResponse
      if (response && typeof response === "object" && "data" in response) {
        data = (response as ResponsePack<WhiteboardResponse>).data
      } else {
        data = response as WhiteboardResponse
      }

      // Ensure all fields have default values
      const normalized: WhiteboardResponse = {
        id: data.id ?? null,
        class_id: data.class_id,
        canvas_state: data.canvas_state ?? null,
        images_data: data.images_data ?? {},
        videos_data: data.videos_data ?? {},
        text_boxes: data.text_boxes ?? [],
        is_active: data.is_active ?? true,
        allow_student_edit: data.allow_student_edit ?? false,
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      }

      console.log("[WhiteboardAPI.getByClass] Normalized response:", normalized)
      return normalized
    })
  },

  /**
   * Update whiteboard state
   */
  update: (classId: string, data: UpdateWhiteboardData): Promise<WhiteboardResponse> => {
    return apiFetch<ResponsePack<WhiteboardResponse>>(
      `/whiteboards/class/${classId}`,
      {
        method: "PATCH",
        data,
      },
      true
    ).then((response) => {
      // Handle wrapped response
      if (response && typeof response === "object" && "data" in response) {
        return (response as ResponsePack<WhiteboardResponse>).data
      }
      return response as WhiteboardResponse
    })
  },
}
