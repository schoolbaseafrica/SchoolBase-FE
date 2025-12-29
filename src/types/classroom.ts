export interface Classroom {
  id: string
  name: string
  capacity: number
  type: string
  location: string
  description?: string | null // Make optional
  is_available: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateClassroomData {
  name: string
  capacity: number
  type: string
  location: string
  description?: string // Make optional
}

export interface UpdateClassroomData extends Partial<CreateClassroomData> {
  is_available?: boolean
}

export interface GetClassroomsParams {
  search?: string
  type?: string
  location?: string
  is_available?: boolean
  page?: number
}
