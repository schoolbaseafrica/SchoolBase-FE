"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { StudentsAPI } from "@/lib/students"
import { MissingClassesDialog } from "./missing-classes-dialog"

interface BulkStudentUploadDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

export default function BulkStudentUploadDialog({
  open,
  setOpen,
  onSuccess,
}: BulkStudentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showMissingClassesDialog, setShowMissingClassesDialog] = useState(false)
  const [validationData, setValidationData] = useState<{
    missing_classes: Array<{ name: string; arm?: string; student_count: number }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file")
      return
    }

    // First, validate the CSV to check for missing classes
    setIsValidating(true)
    try {
      const validationResponse = await StudentsAPI.validateBulkUpload(file)
      const validation = validationResponse.data

      // If there are missing classes, show the dialog
      if (validation.missing_classes && validation.missing_classes.length > 0) {
        setValidationData(validation)
        setShowMissingClassesDialog(true)
        setIsValidating(false)
        return
      }

      // No missing classes, proceed with upload
      await performUpload()
    } catch (error: any) {
      toast.error(error?.message || "Failed to validate CSV")
      setIsValidating(false)
    }
  }

  const performUpload = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const response = await StudentsAPI.bulkUpload(file)
      const result = response.data

      if (result.failed === 0) {
        toast.success(`Successfully uploaded ${result.successful} students`)
      } else {
        toast.warning(
          `Upload completed: ${result.successful} successful, ${result.failed} failed`
        )
      }

      // Invalidate students queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["students"] })
      
      onSuccess?.()
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setValidationData(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload students")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassesCreated = async () => {
    // Classes have been created, now proceed with upload
    await performUpload()
  }

  const handleSkipClasses = async () => {
    // User chose to skip creating classes, proceed with upload anyway
    await performUpload()
  }

  const handleClose = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        aria-describedby="bulk-upload-students-description"
      >
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription id="bulk-upload-students-description">
            Upload a CSV file to create multiple students at once.
            <br />
            <strong>Expected format:</strong> First Name, Last Name, Middle Name (optional), Email, Phone, Registration Number, Date of Birth, Gender, Home Address (optional), Password, Class (optional), Arm (optional)
            <br />
            <strong>Note:</strong> All fields except Middle Name, Home Address, Class, and Arm are required. If Class is provided, students will be assigned to that class. If the class doesn't exist, you'll be prompted to create it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
              {file && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-gray-400">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isLoading || isValidating}>
            {(isLoading || isValidating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isValidating ? "Validating..." : "Upload Students"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Missing Classes Dialog */}
      {validationData && (
        <MissingClassesDialog
          open={showMissingClassesDialog}
          onOpenChange={setShowMissingClassesDialog}
          missingClasses={validationData.missing_classes}
          onClassesCreated={handleClassesCreated}
          onSkip={handleSkipClasses}
        />
      )}
    </Dialog>
  )
}
