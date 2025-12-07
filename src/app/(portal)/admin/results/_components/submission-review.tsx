"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GradeSubmission } from "@/types/result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { SuccessModal } from "@/components/results/success-modal"
import { RejectionModal } from "@/components/results/rejection-modal"
import { useApproveSubmission, useRejectSubmission } from "../_hooks/use-admin-results"
import { toast } from "sonner"
import { ResultsAPI } from "@/lib/results"

// Define a type for the grade with student info based on your console log
interface GradeWithStudentInfo {
  id: string
  student_id: string
  subject_id?: string
  class_id?: string
  term_id?: string
  ca_score: string | number | null
  exam_score: string | number | null
  total_score: string | number | null
  grade_letter?: string | null // From backend
  grade?: string | null // Also check for grade property
  comment?: string | null
  student?: {
    id: string
    name: string
    registration_number?: string
  }
  studentName?: string // Added for fallback
  registrationNumber?: string // Added for fallback
}

interface SubmissionReviewProps {
  submission: GradeSubmission
}

export function SubmissionReview({ submission }: SubmissionReviewProps) {
  const router = useRouter()
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [gradesWithStudentInfo, setGradesWithStudentInfo] = useState<
    GradeWithStudentInfo[]
  >([])
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(true)

  const approveMutation = useApproveSubmission()
  const rejectMutation = useRejectSubmission()

  // Fix 1: Check if the submission has student info in the grades
  useEffect(() => {
    console.log("DEBUG - Submission grades structure:", submission.grades)

    // First check if grades already have student info from backend
    const gradesFromBackend = submission.grades as unknown as GradeWithStudentInfo[]

    if (gradesFromBackend && gradesFromBackend.length > 0) {
      // Check if the first grade has student info
      const firstGrade = gradesFromBackend[0]
      console.log("First grade structure:", firstGrade)

      if (firstGrade && "student" in firstGrade && firstGrade.student) {
        // Grades already have student info from backend
        console.log("Grades already have student info from backend")
        setGradesWithStudentInfo(gradesFromBackend)
        setLoadingStudentInfo(false)
        return
      }
    }

    // If not, fetch student info
    const fetchStudentInfo = async () => {
      setLoadingStudentInfo(true)
      try {
        const gradesWithInfo = await Promise.all(
          submission.grades.map(async (grade) => {
            try {
              // Make sure grade has student_id
              if (!grade.student_id) {
                console.warn("Grade missing student_id:", grade)
                return {
                  ...grade,
                  studentName: "Unknown Student",
                  registrationNumber: "N/A",
                } as GradeWithStudentInfo
              }

              // Fetch student info
              const studentInfo = await ResultsAPI.getStudentInfo(grade.student_id)
              return {
                ...grade,
                studentName:
                  studentInfo.name || `Student ${grade.student_id.substring(0, 8)}`,
                registrationNumber: studentInfo.registration_number || grade.student_id,
              } as unknown as GradeWithStudentInfo
            } catch (error) {
              console.error(`Error fetching student info for ${grade.student_id}:`, error)
              // Fallback: use student_id if available
              return {
                ...grade,
                studentName: `Student ${grade.student_id?.substring(0, 8) || "Unknown"}`,
                registrationNumber: grade.student_id || "N/A",
              } as unknown as GradeWithStudentInfo
            }
          })
        )
        setGradesWithStudentInfo(gradesWithInfo)
      } catch (error) {
        console.error("Error fetching student info:", error)
        // Fallback: use just the grade data with safe student_id access
        setGradesWithStudentInfo(
          submission.grades.map((grade) => ({
            ...grade,
            studentName: `Student ${grade.student_id?.substring(0, 8) || "Unknown"}`,
            registrationNumber: grade.student_id || "N/A",
          })) as unknown as GradeWithStudentInfo[]
        )
      } finally {
        setLoadingStudentInfo(false)
      }
    }

    if (submission.grades && submission.grades.length > 0) {
      fetchStudentInfo()
    } else {
      setGradesWithStudentInfo([])
      setLoadingStudentInfo(false)
    }
  }, [submission.grades])

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: submission.id })
      setSuccessMessage("Submission approved successfully!")
      setSuccessModalOpen(true)
    } catch (error) {
      console.error("Failed to approve submission:", error)
      toast.error("Failed to approve submission")
    }
  }

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({ id: submission.id, reason })
      setRejectionModalOpen(false)
      setSuccessMessage("Submission rejected successfully!")
      setSuccessModalOpen(true)
    } catch (error) {
      console.error("Failed to reject submission:", error)
      toast.error("Failed to reject submission")
    }
  }

  const handleSuccessClose = () => {
    setSuccessModalOpen(false)
    router.push("/admin/results")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline">Pending Review</Badge>
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "rejected":
        return <Badge variant="inactive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Fix 2: Check status correctly - looking at your console log, status is "SUBMITTED" (uppercase)
  const isActionable = submission.status.toLowerCase() === "submitted"

  // Extract names from submission data
  const teacherName =
    submission.teacher?.name || submission.teacher_id || "Unknown Teacher"
  const className = submission.class?.name || submission.class_id || "Unknown Class"
  const subjectName =
    submission.subject?.name || submission.subject_id || "Unknown Subject"
  const termName = submission.term?.name || submission.term_id || "Unknown Term"

  // Helper to get student name
  const getStudentName = (grade: GradeWithStudentInfo): string => {
    // Check if grade has student object with name
    if (grade.student && grade.student.name) {
      return grade.student.name
    }
    // Check if grade has studentName property
    if (grade.studentName) {
      return grade.studentName
    }
    // Fallback
    return `Student ${grade.student_id?.substring(0, 8) || "Unknown"}`
  }

  // Helper to get grade letter - looking at console log, it's grade_letter
  const getGradeLetter = (grade: GradeWithStudentInfo): string => {
    // Check if grade_letter exists
    if (grade.grade_letter) {
      return grade.grade_letter
    }
    // Check if grade exists
    if (grade.grade) {
      return grade.grade
    }
    return "-"
  }

  // Helper to safely convert score to number for display
  const formatScore = (score: string | number | null): string => {
    if (score === null || score === undefined) return "-"

    // If it's a number, return it as string
    if (typeof score === "number") {
      return score.toString()
    }

    // If it's a string, try to parse it
    if (typeof score === "string") {
      const parsed = parseFloat(score)
      return isNaN(parsed) ? score : parsed.toString()
    }

    return "-"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Submission</h1>
        <p className="text-gray-600">Review and approve teacher-submitted results</p>
      </div>

      {/* Submission Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Teacher: {teacherName}</CardTitle>
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Class</span>
                    <p className="text-lg">{className}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Subject</span>
                    <p className="text-lg">{subjectName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Term</span>
                    <p className="text-lg">{termName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Date Submitted
                    </span>
                    <p className="text-lg">
                      {submission.submitted_at
                        ? format(new Date(submission.submitted_at), "MMM d, yyyy")
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Number of Students
                  </span>
                  <p className="text-lg">{submission.grades?.length || 0}</p>
                </div>
              </div>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">CA (30)</TableHead>
                  <TableHead className="text-center">Exam (70)</TableHead>
                  <TableHead className="text-center">Total (100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudentInfo ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      Loading student information...
                    </TableCell>
                  </TableRow>
                ) : gradesWithStudentInfo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      No grades found in this submission
                    </TableCell>
                  </TableRow>
                ) : (
                  gradesWithStudentInfo.map((grade) => (
                    <TableRow key={grade.id || grade.student_id}>
                      <TableCell>
                        {/* Fix 1: Get student name correctly */}
                        {getStudentName(grade)}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Fix 3: Display scores correctly */}
                        {formatScore(grade.ca_score)}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Fix 3: Display scores correctly */}
                        {formatScore(grade.exam_score)}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Fix 3: Display scores correctly */}
                        {formatScore(grade.total_score)}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Fix 3: Display grade correctly - looking at console log it's grade_letter */}
                        {getGradeLetter(grade)}
                      </TableCell>
                      <TableCell>
                        {/* Fix 3: Display comment correctly */}
                        {grade.comment || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {/* Fix 2: Show buttons when status is submitted */}
      {isActionable && (
        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:justify-end">
          <Button
            onClick={() => setRejectionModalOpen(true)}
            disabled={rejectMutation.isPending || approveMutation.isPending}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="bg-green-600 hover:bg-green-700 sm:w-auto"
          >
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </Button>
        </div>
      )}

      <RejectionModal
        open={rejectionModalOpen}
        onOpenChange={setRejectionModalOpen}
        onReject={handleReject}
        isRejecting={rejectMutation.isPending}
      />

      <SuccessModal
        open={successModalOpen}
        onOpenChange={handleSuccessClose}
        title="Success"
        description={successMessage}
        buttonText="Back to Submissions"
      />
    </div>
  )
}
