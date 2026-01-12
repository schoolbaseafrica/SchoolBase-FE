"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Upload, Users, FileSpreadsheet, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { StudentsAPI } from "@/lib/students"
import BulkAssignClassDialog from "./bulk-assign-class-dialog"
import BulkNfcImportDialog from "./bulk-nfc-import-dialog"
import BulkStudentUploadDialog from "./bulk-student-upload-dialog"

export function BulkActionsMenu() {
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false)
  const [showBulkNfcImportDialog, setShowBulkNfcImportDialog] = useState(false)
  const [showBulkStudentUploadDialog, setShowBulkStudentUploadDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportNfc = async () => {
    setIsExporting(true)
    try {
      await StudentsAPI.exportNfcCardsCsv()
      toast.success("NFC cards exported successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to export NFC cards")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="lg" className="whitespace-nowrap">
            Bulk Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => setShowBulkStudentUploadDialog(true)}
            className="cursor-pointer"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Upload Students (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowBulkAssignDialog(true)}
            className="cursor-pointer"
          >
            <Users className="mr-2 h-4 w-4" />
            Assign Students to Class
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowBulkNfcImportDialog(true)}
            className="cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import NFC Cards (CSV)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleExportNfc}
            className="cursor-pointer"
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export NFC Cards (CSV)"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BulkAssignClassDialog
        open={showBulkAssignDialog}
        setOpen={setShowBulkAssignDialog}
        onSuccess={() => {}}
      />

      <BulkNfcImportDialog
        open={showBulkNfcImportDialog}
        setOpen={setShowBulkNfcImportDialog}
        onSuccess={() => {}}
      />

      <BulkStudentUploadDialog
        open={showBulkStudentUploadDialog}
        setOpen={setShowBulkStudentUploadDialog}
        onSuccess={() => {}}
      />
    </>
  )
}
