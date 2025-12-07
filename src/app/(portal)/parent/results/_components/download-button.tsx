"use client"

import { useState } from "react"
import { StudentResult } from "@/types/result"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface DownloadButtonProps {
  result: StudentResult
  studentId: string
  className: string
  term: string
}

export function DownloadButton({
  result,
  studentId,
  className,
  term,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Generate PDF using the result data
      const pdfUrl = await generateResultPDF(result, studentId, className, term)

      // Trigger download
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `Result-${className}-${term}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Result downloaded successfully!")
    } catch (error) {
      console.error("Error downloading result:", error)
      toast.error("Failed to download result. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const generateResultPDF = async (
    result: StudentResult,
    studentId: string,
    className: string,
    term: string
  ): Promise<string> => {
    // Dynamically import jsPDF
    const { jsPDF } = await import("jspdf")

    const doc = new jsPDF()

    // Add header
    doc.setFontSize(20)
    doc.text("ACADEMIC RESULT", 105, 20, { align: "center" as const })

    doc.setFontSize(12)
    doc.text(`Student ID: ${studentId}`, 20, 35)
    doc.text(`Class: ${className}`, 20, 45)
    doc.text(`Term: ${term}`, 20, 55)
    doc.text(`Position: ${result.position || "N/A"}`, 140, 35)
    doc.text(`Total Score: ${result.total_score}`, 140, 45)
    doc.text(`Average: ${result.average_score.toFixed(2)}`, 140, 55)

    // Add table header
    doc.setFontSize(10)
    doc.text("Subject", 20, 70)
    doc.text("CA", 80, 70)
    doc.text("Exam", 100, 70)
    doc.text("Total", 120, 70)
    doc.text("Grade", 140, 70)
    doc.text("Remark", 160, 70)

    // Add subjects
    let yPosition = 80
    result.subjects.forEach((subject) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(subject.subject_name || subject.subject_id, 20, yPosition)
      doc.text(subject.ca_score?.toString() || "-", 80, yPosition)
      doc.text(subject.exam_score?.toString() || "-", 100, yPosition)
      doc.text(subject.total_score?.toString() || "-", 120, yPosition)
      doc.text(subject.grade_letter, 140, yPosition)
      doc.text(subject.remark || "-", 160, yPosition)

      yPosition += 10
    })

    // Add footer with remark
    yPosition += 10
    doc.setFontSize(12)
    doc.text(`Overall Remark: ${result.remark || "No remark"}`, 20, yPosition)

    // Convert to data URL
    return doc.output("dataurlstring") as string
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
      {isDownloading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Result (PDF)
        </>
      )}
    </Button>
  )
}
