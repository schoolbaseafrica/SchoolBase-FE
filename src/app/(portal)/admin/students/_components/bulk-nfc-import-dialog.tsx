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
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { StudentsAPI } from "@/lib/students"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BulkNfcImportDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

export default function BulkNfcImportDialog({
  open,
  setOpen,
  onSuccess,
}: BulkNfcImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const [result, setResult] = useState<{
    total: number
    successful: number
    failed: number
    results: Array<{
      student_identifier: string
      success: boolean
      nfc_card_id?: string
      error?: string
    }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file")
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file")
      return
    }

    setIsLoading(true)
    try {
      const response = await StudentsAPI.bulkImportNfcCards(file)
      setResult(response.data)

      if (response.data.failed === 0) {
        toast.success(`Successfully assigned ${response.data.successful} NFC card IDs`)
      } else {
        toast.warning(
          `Import completed: ${response.data.successful} successful, ${response.data.failed} failed`
        )
      }

      // Invalidate students queries to refetch the list with updated NFC card IDs
      queryClient.invalidateQueries({ queryKey: ["students"] })
      
      onSuccess?.()
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setResult(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
      } else {
        toast.warning(
          `Completed: ${response.data.successful} successful, ${response.data.failed} failed`
        )
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to import NFC cards")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import NFC Cards</DialogTitle>
          <DialogDescription>
            Upload a CSV file to assign NFC card IDs to multiple students at once.
            <br />
            <strong>Expected format:</strong> Registration Number, Student Name, NFC Card
            ID
            <br />
            <strong>Note:</strong> Leave NFC Card ID empty or use "GENERATE" to
            auto-generate.
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

          {result && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {result.successful} successful
                    </span>
                    {result.failed > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {result.failed} failed
                      </span>
                    )}
                  </div>
                  {result.failed > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto text-sm">
                      <strong>Failed assignments:</strong>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        {result.results
                          .filter((r) => !r.success)
                          .map((r, i) => (
                            <li key={i} className="text-red-600">
                              {r.student_identifier}: {r.error}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <strong>CSV Format Example:</strong>
            <pre className="mt-1 text-xs">
              {`Registration Number,Student Name,NFC Card ID
REG-2025-0014,John Doe,NFC-ABC123XYZ456
REG-2025-0015,Jane Smith,GENERATE
REG-2025-0016,Bob Johnson,`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? "Uploading..." : "Upload & Assign"}
            {!isLoading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
