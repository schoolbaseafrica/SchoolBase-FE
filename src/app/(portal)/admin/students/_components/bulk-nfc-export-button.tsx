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
      disabled={isLoading}
      className="w-full rounded-xl font-medium sm:w-auto"
    >
      <Download className="mr-2 h-5 w-5" />
      {isLoading ? "Exporting..." : "Export NFC Cards (CSV)"}
    </Button>
  )
}
