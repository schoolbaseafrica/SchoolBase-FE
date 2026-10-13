import { useQuery } from "@tanstack/react-query"
import { SubjectsAPI } from "@/lib/subjects"

export function useSubjects(enabled = true) {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => SubjectsAPI.getAll(),
    enabled,
  })
}
