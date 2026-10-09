"use client"

import { useState } from "react"
import { StudentResult } from "@/types/result"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface DownloadButtonProps {
  result: StudentResult
  studentId: string
  studentName: string
  className: string
  term: string
}

export function DownloadButton({
  result,
  studentId,
  studentName,
  className,
  term,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await generateResultPDF(result, studentId, studentName, className, term)

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
    studentName: string,
    className: string,
    term: string
  ): Promise<void> => {
    // Dynamically import jsPDF
    const { jsPDF } = await import("jspdf")

    const doc = new jsPDF()

    // Add header
    doc.setFontSize(20)
    doc.text("ACADEMIC RESULT", 105, 20, { align: "center" as const })

    doc.setFontSize(12)
    doc.text(`Student: ${studentName}`, 20, 35, { maxWidth: 110 })
    doc.text(`Student ID: ${studentId}`, 20, 45)
    doc.text(`Class: ${className}`, 20, 55)
    doc.text(`Term: ${term}`, 20, 65)
    doc.text(`Session: ${result.academic_session_name}`, 20, 75)
    doc.text(`Position: ${result.position || "N/A"}`, 140, 45)
    doc.text(`Total: ${result.total_score}`, 140, 55)
    doc.text(`Average: ${Number(result.average_score).toFixed(2)}`, 140, 65)

    // Add table header
    doc.setFontSize(10)
    const columns = [20, 78, 100, 122, 144, 160]
    const drawHeader = (y: number) => {
      ;["Subject", "CA", "Exam", "Total", "Grade", "Remark"].forEach((label, index) =>
        doc.text(label, columns[index], y)
      )
      doc.line(20, y + 3, 190, y + 3)
    }
    drawHeader(90)

    // Add subjects
    let yPosition = 101
    result.subjects.forEach((subject) => {
      const subjectLines = doc.splitTextToSize(
        subject.subject_name || subject.subject_id,
        54
      )
      const remarkLines = doc.splitTextToSize(subject.remark || "-", 30)
      const rowHeight = Math.max(subjectLines.length, remarkLines.length) * 5 + 5
      if (yPosition + rowHeight > 270) {
        doc.addPage()
        drawHeader(20)
        yPosition = 31
      }

      doc.text(subjectLines, columns[0], yPosition)
      doc.text(subject.ca_score?.toString() ?? "-", columns[1], yPosition)
      doc.text(subject.exam_score?.toString() ?? "-", columns[2], yPosition)
      doc.text(subject.total_score?.toString() ?? "-", columns[3], yPosition)
      doc.text(subject.grade_letter, columns[4], yPosition)
      doc.text(remarkLines, columns[5], yPosition)

      yPosition += rowHeight
    })

    // Add footer with remark
    yPosition += 10
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    doc.setFontSize(12)
    doc.text(
      doc.splitTextToSize(`Overall Remark: ${result.remark || "No remark"}`, 170),
      20,
      yPosition
    )

    doc.save(`School-Result-${result.id}.pdf`)
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
