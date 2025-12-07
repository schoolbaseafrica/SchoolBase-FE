import { useQuery } from "@tanstack/react-query"
import { FeesAPI } from "@/lib/fees"

interface UseStudentFeeDetailsProps {
  studentId?: string
  termId?: string
  sessionId?: string
}

export const useStudentFeeDetails = ({
  studentId,
  termId,
  sessionId,
}: UseStudentFeeDetailsProps) => {
  return useQuery({
    queryKey: ["student-fee-details", studentId, termId, sessionId],
    queryFn: () =>
      FeesAPI.getStudentFeeDetails(studentId!, {
        term_id: termId!,
        session_id: sessionId!,
      }),
    enabled: !!studentId && !!termId && !!sessionId,
  })
}
