"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { StudentsAPI } from "@/lib/students"

export default function BulkNfcExportButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      await StudentsAPI.exportNfcCardsCsv()
      toast.success("NFC cards exported successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to export NFC cards")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="lg"
      disabled={isLoading}
      className="whitespace-nowrap"
    >
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Exporting..." : "Export NFC Cards (CSV)"}
    </Button>
  )
}
