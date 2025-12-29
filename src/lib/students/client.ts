import { apiFetch } from "../api/client"

type ResponsePack<T> = {
  data: T
  message: string
  status_code: number
}

export interface StudentProfileResponse {
  id: string
  registration_number?: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  photo_url?: string
  class_details: {
    id: string
    name: string
  } | null
  academic_details: {
    id: string
    name: string
    academic_year?: string
    start_date?: string
    end_date?: string
    status?: string
  } | null
}

export const StudentsAPI = {
  getStudentProfile: async (studentId: string) => {
    const response = await apiFetch<ResponsePack<StudentProfileResponse>>(
      `/students/profile/${studentId}`,
      { method: "GET" },
      true
    )
    console.log("[StudentsAPI.getStudentProfile] Raw API response:", response)
    console.log("[StudentsAPI.getStudentProfile] Unwrapped data:", response.data)
    console.log(
      "[StudentsAPI.getStudentProfile] class_details in response.data:",
      response.data?.class_details
    )
    return response.data
  },
}
