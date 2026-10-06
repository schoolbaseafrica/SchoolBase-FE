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
import { ParentsAPI } from "@/lib/parents"

interface BulkParentUploadDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

export default function BulkParentUploadDialog({
  open,
  setOpen,
  onSuccess,
}: BulkParentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadIssues, setUploadIssues] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(null)
      setUploadIssues([])
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file")
        e.target.value = ""
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("CSV files must be 5 MB or smaller")
        e.target.value = ""
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

    setIsLoading(true)
    try {
      const response = await ParentsAPI.bulkUpload(file)
      const result = response.data
      setUploadIssues(
        result.results
          .filter((item) => item.error)
          .map((item) => `${item.email || "Row"}: ${item.error}`)
      )

      if (result.failed === 0) {
        toast.success(`Successfully uploaded ${result.successful} parents`)
      } else {
        toast.warning(
          `Upload completed: ${result.successful} successful, ${result.failed} failed`
        )
      }

      // Invalidate parents queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["parents"] })

      onSuccess?.()
      if (result.failed === 0) {
        setTimeout(() => {
          setOpen(false)
          setFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
        }, 2000)
      } else {
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload parents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setUploadIssues([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : handleClose())}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Parents</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple parents at once.
            <br />
            <strong>Expected headings:</strong> First Name, Last Name, Middle Name
            (optional), Email, Phone, Date of Birth, Gender, Home Address (optional),
            Password (optional).
            <br />
            <strong>Note:</strong> Parent accounts receive a system ID. Custom Parent IDs
            are not supported by this import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploadIssues.length > 0 && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/5 max-h-40 overflow-y-auto rounded-xl border p-3 text-sm"
            >
              <p className="font-semibold">Rows needing attention</p>
              <ul className="mt-2 list-inside list-disc">
                {uploadIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
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
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Parents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
