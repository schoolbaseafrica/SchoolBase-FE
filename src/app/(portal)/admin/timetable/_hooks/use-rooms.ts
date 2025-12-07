import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"

export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  location: string
}

export interface RoomsResponse {
  data: {
    rooms: Room[]
  }
}

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: () => apiFetch<RoomsResponse>("/rooms", { method: "GET" }, true),
  })
}
