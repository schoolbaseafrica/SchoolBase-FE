export interface ClassroomMessage {
  id: string
  class_id: string
  sender_type: "teacher" | "student"
  sender_id: string
  sender_name?: string // Added: Sender's full name (first_name + last_name)
  text: string | null
  audio_url: string | null
  audio_duration: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateMessageData {
  class_id: string
  text: string
}
