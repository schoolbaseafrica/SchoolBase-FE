import { useQuery } from "@tanstack/react-query"
import { SubjectsAPI } from "@/lib/subjects"

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => SubjectsAPI.getAll(),
  })
}
