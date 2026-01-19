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

    setIsLoading(true)
    try {
      const response = await ParentsAPI.bulkUpload(file)
      const result = response.data

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
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload parents")
    } finally {
      setIsLoading(false)
    }
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Parents</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple parents at once.
            <br />
            <strong>Expected format:</strong> First Name, Last Name, Middle Name (optional), Email, Phone, Date of Birth, Gender, Home Address, Password (optional), Parent ID (optional)
            <br />
            <strong>Note:</strong> All fields except Middle Name, Password, and Parent ID are required. Parent ID will be auto-generated if not provided.
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
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Parents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
