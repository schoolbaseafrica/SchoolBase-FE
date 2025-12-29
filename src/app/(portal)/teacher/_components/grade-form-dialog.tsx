"use client"

import { useState, useMemo } from "react"
import { Student, GradeEntry } from "@/types/result"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { calculateGrade } from "@/lib/results"
import { useSaveDraft, useUpdateGrade } from "../_hooks/use-results" // Import useUpdateGrade
import { toast } from "sonner"

interface GradeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student
  grade?: GradeEntry & { id?: string } // Add id for existing grades
  onSave: (gradeData: GradeEntry & { id?: string }) => void // Update to include id
  classId: string
  subjectId: string
  termId: string
  academicSessionId: string
  existingSubmissionId?: string
}

export function GradeFormDialog({
  open,
  onOpenChange,
  student,
  grade,
  onSave,
  classId,
  subjectId,
  termId,
  academicSessionId,
}: GradeFormDialogProps) {
  const [formData, setFormData] = useState({
    ca_score: grade?.ca_score?.toString() || "",
    exam_score: grade?.exam_score?.toString() || "",
    comment: grade?.comment || "",
  })

  const [validationErrors, setValidationErrors] = useState<{
    ca_score?: string
    exam_score?: string
  }>({})

  const saveDraftMutation = useSaveDraft()
  const updateGradeMutation = useUpdateGrade() // Add update mutation

  const total = useMemo(() => {
    const ca = parseInt(formData.ca_score) || 0
    const exam = parseInt(formData.exam_score) || 0
    return ca + exam
  }, [formData.ca_score, formData.exam_score])

  const gradeLetter = useMemo(() => {
    return total > 0 ? calculateGrade(total) : ""
  }, [total])

  const validateScores = (): boolean => {
    const errors: { ca_score?: string; exam_score?: string } = {}

    if (formData.ca_score !== "") {
      const ca = parseInt(formData.ca_score)
      if (isNaN(ca)) {
        errors.ca_score = "CA score must be a valid number"
      } else if (ca < 0 || ca > 30) {
        errors.ca_score = "CA score must be between 0 and 30"
      }
    }

    if (formData.exam_score !== "") {
      const exam = parseInt(formData.exam_score)
      if (isNaN(exam)) {
        errors.exam_score = "Exam score must be a valid number"
      } else if (exam < 0 || exam > 70) {
        errors.exam_score = "Exam score must be between 0 and 70"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveToBackend = async () => {
    try {
      if (!academicSessionId) {
        toast.error("Academic session ID is required")
        return
      }

      // Validate scores before proceeding
      if (!validateScores()) {
        return
      }

      const caScore = formData.ca_score ? parseInt(formData.ca_score) : null
      const examScore = formData.exam_score ? parseInt(formData.exam_score) : null

      const submissionData = {
        class_id: classId,
        subject_id: subjectId,
        term_id: termId,
        academic_session_id: academicSessionId,
        grades: [
          {
            student_id: student.id,
            ca_score: caScore,
            exam_score: examScore,
            comment: formData.comment || null,
          },
        ],
      }

      // If we have an existing grade ID, update it instead of creating new
      if (grade?.id) {
        await updateGradeMutation.mutateAsync({
          gradeId: grade.id,
          data: {
            ca_score: caScore,
            exam_score: examScore,
            comment: formData.comment || null,
          },
        })
      } else {
        await saveDraftMutation.mutateAsync(submissionData)
      }

      // Also update local state
      const totalScore =
        caScore !== null && examScore !== null ? caScore + examScore : null
      const gradeData: GradeEntry & { id?: string } = {
        id: grade?.id, // Preserve the ID if it exists
        student_id: student.id,
        ca_score: caScore,
        exam_score: examScore,
        total_score: totalScore,
        grade: totalScore !== null ? calculateGrade(totalScore) : null,
        comment: formData.comment || null,
      }

      onSave(gradeData)
      // Don't show success toast here - the mutation already does it
      onOpenChange(false)
    } catch (error) {
      // Error is already handled by the mutation
      console.error("Failed to save grade:", error)
    }
  }

  const handleInputChange = (field: "ca_score" | "exam_score", value: string) => {
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{grade?.id ? "Edit Grade" : "Enter Grade"}</DialogTitle>
          <div className="text-sm text-gray-600">
            {student.first_name} {student.last_name}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ca_score">CA Score (0-30)</Label>
              <Input
                id="ca_score"
                type="number"
                min="0"
                max="30"
                value={formData.ca_score}
                onChange={(e) => handleInputChange("ca_score", e.target.value)}
                placeholder="Enter CA score"
                className={validationErrors.ca_score ? "border-red-500" : ""}
              />
              {validationErrors.ca_score && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.ca_score}</p>
              )}
            </div>

            <div>
              <Label htmlFor="exam_score">Exam Score (0-70)</Label>
              <Input
                id="exam_score"
                type="number"
                min="0"
                max="70"
                value={formData.exam_score}
                onChange={(e) => handleInputChange("exam_score", e.target.value)}
                placeholder="Enter exam score"
                className={validationErrors.exam_score ? "border-red-500" : ""}
              />
              {validationErrors.exam_score && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.exam_score}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex h-30 flex-col items-center justify-center rounded-md border bg-gray-50">
                <Label className="text-sm text-gray-600">Total Score</Label>
                <span className="text-2xl font-semibold">{total}</span>
              </div>
            </div>

            <div>
              <div className="flex h-30 flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50">
                <Label className="text-sm text-gray-600">Grade</Label>
                <span className="text-2xl font-semibold text-gray-800">
                  {gradeLetter || "-"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Enter comment..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveToBackend}
            disabled={saveDraftMutation.isPending || updateGradeMutation.isPending}
          >
            {saveDraftMutation.isPending || updateGradeMutation.isPending
              ? "Saving..."
              : grade?.id
                ? "Update Grade"
                : "Save Grade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
