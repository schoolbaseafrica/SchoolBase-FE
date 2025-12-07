"use client"

import { GradeSubmission } from "@/types/result"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface SubmissionCardProps {
  submission: GradeSubmission
}

// Helper type for nested objects
interface TeacherInfo {
  name?: string
  title?: string
}

interface ClassInfo {
  name?: string
  arm?: string
}

interface SubjectInfo {
  name?: string
}

interface TermInfo {
  name?: string
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const router = useRouter()

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "inactive" // Changed from "destructive" to "inactive"
      case "submitted":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Pending Review"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Helper function to safely extract object properties without 'any'
  const getNestedProperty = <T,>(obj: unknown, key: string): T | undefined => {
    if (!obj || typeof obj !== "object") return undefined
    return (obj as Record<string, T>)[key]
  }

  // Extract names from submission data
  const teacherName =
    getNestedProperty<string>(submission.teacher, "name") ||
    getNestedProperty<string>(submission.teacher, "title") ||
    submission.teacher_id ||
    "Unknown Teacher"

  const className =
    getNestedProperty<string>(submission.class, "name") ||
    (getNestedProperty<string>(submission.class, "arm")
      ? `${getNestedProperty<string>(submission.class, "name") || ""} ${getNestedProperty<string>(submission.class, "arm") || ""}`.trim()
      : submission.class_id) ||
    "Unknown Class"

  const subjectName =
    getNestedProperty<string>(submission.subject, "name") ||
    submission.subject_id ||
    "Unknown Subject"

  const termName =
    getNestedProperty<string>(submission.term, "name") ||
    submission.term_id ||
    "Unknown Term"

  const handleReview = () => {
    router.push(`/admin/results/${submission.id}`)
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{teacherName}</h3>
            <p className="text-sm text-gray-600">
              {className} • {subjectName}
            </p>
          </div>
          <Badge variant={getStatusVariant(submission.status)}>
            {getStatusText(submission.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="text-sm">
          <span className="font-medium">Term:</span> {termName}
        </div>
        <div className="text-sm">
          <span className="font-medium">Students:</span>{" "}
          {submission.grades?.length || submission.student_count || "Multiple"}
        </div>
        {submission.submitted_at && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Submitted:</span>{" "}
            {format(new Date(submission.submitted_at), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleReview} className="w-full" variant="outline">
          Review Submission
        </Button>
      </CardFooter>
    </Card>
  )
}
