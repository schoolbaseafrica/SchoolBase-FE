"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { CbtAttemptSummary } from "@/lib/cbt"

export function DownloadCbtResultButton({
  examName,
  attempt,
}: {
  examName: string
  attempt: CbtAttemptSummary
}) {
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    if (
      !attempt.resultVisible ||
      attempt.percentage === null ||
      attempt.percentage === undefined
    )
      return
    setDownloading(true)
    try {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF()
      pdf.setFontSize(18)
      pdf.text("EXAMINATION RESULT", 20, 25)
      pdf.setFontSize(11)
      pdf.text(`Examination: ${examName}`, 20, 45, { maxWidth: 170 })
      pdf.text(`Attempt: ${attempt.id}`, 20, 65)
      pdf.text(
        `Submitted: ${attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—"}`,
        20,
        75
      )
      pdf.text(`Score: ${attempt.score ?? "—"} / ${attempt.totalMarks ?? "—"}`, 20, 90)
      pdf.text(`Percentage: ${attempt.percentage}%`, 20, 100)
      pdf.save(`Exam-Result-${attempt.id}.pdf`)
    } catch {
      toast.error("Could not download the exam result. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      disabled={downloading}
      onClick={download}
    >
      <Download className="size-4" />
      {downloading ? "Preparing PDF..." : "Download exam result"}
    </Button>
  )
}
