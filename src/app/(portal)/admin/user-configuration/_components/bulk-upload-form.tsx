"use client"

import { useRef, useState } from "react"
import { FileText, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { BulkUploadSuccess } from "./bulk-upload-success"
import { useBulkInviteUser } from "../_hooks/use-invite-user"

interface ParsedUser {
  name: string
  email: string
}

export function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedUser[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const [userType, setUserType] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadCsv, isPending } = useBulkInviteUser()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setErrors([])

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n")
      const data: ParsedUser[] = []
      const newErrors: string[] = []

      // Simple parsing: assume header is row 0, data starts row 1
      // Format: Name, Email
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const [name, email] = line.split(",")

        const trimmedName = name ? name.trim() : ""
        const trimmedEmail = email ? email.trim() : ""

        if (!trimmedName) {
          newErrors.push(`Row ${i + 1}: Missing Fullname`)
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
          newErrors.push(`Row ${i + 1}: Invalid email format`)
        }

        if (trimmedName && trimmedEmail && emailRegex.test(trimmedEmail)) {
          data.push({ name: trimmedName, email: trimmedEmail })
        }
      }
      setParsedData(data)
      setErrors(newErrors)
    }
    reader.readAsText(uploadedFile)
  }

  const handleDelete = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleSendInvitations = () => {
    if (file && userType) {
      uploadCsv(
        { file, type: userType.toUpperCase() },
        {
          onSuccess: () => setIsSuccess(true),
        }
      )
    }
  }

  if (isSuccess) {
    return <BulkUploadSuccess />
  }

  const displayedData = showAll ? parsedData : parsedData.slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">User Type</label>
        <Select value={userType} onValueChange={setUserType}>
          <SelectTrigger className="font-outfit focus:ring-accent h-13! w-full rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px] placeholder-gray-400 shadow-none transition-all focus:border-transparent focus:ring-2 focus:outline-none">
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="admin"
              className="text-[#535353] focus:bg-red-50 focus:text-[#DA3743] data-[state=checked]:text-[#DA3743]"
            >
              Admin
            </SelectItem>
            <SelectItem
              value="teacher"
              className="text-[#535353] focus:bg-red-50 focus:text-[#DA3743] data-[state=checked]:text-[#DA3743]"
            >
              Teacher
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">
          Upload CSV File <span className="text-red-600">*</span>
        </label>
        {!file ? (
          <div className="relative flex h-[314px] w-full flex-col items-center justify-center gap-4 rounded-[8px] border-[0.8px] border-solid border-[#2D2D2D4D] bg-white transition-colors hover:bg-gray-50">
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-6 w-6 text-gray-600" />{" "}
              {/* Changed from CloudUpload to Upload as per instruction */}
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-medium text-[#2d2d2d]">
                Drag and Drop your file here
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </div>
            <div className="text-sm text-gray-400">Or</div>
            <Button
              type="button"
              className="z-20 bg-[#DA3743] hover:bg-[#DA3743]/90"
              onClick={() => inputRef.current?.click()}
            >
              Upload (CSV)
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-[8px] border-[0.8px] border-[#2D2D2D4D] px-[12px] py-[10px]">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-900">{file.name}</span>
              </div>
              <button onClick={handleDelete} className="text-black hover:text-gray-700">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-[#2D2D2D4D]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2D2D2D4D] bg-white">
                    <TableHead className="h-[52px] px-[10px] py-4 text-sm font-semibold text-gray-900">
                      Full Name
                    </TableHead>
                    <TableHead className="h-[52px] px-[10px] py-4 text-sm font-semibold text-gray-900">
                      Email Address
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {displayedData.map((user, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-[#2D2D2D4D] last:border-0"
                    >
                      <TableCell className="h-[52px] px-[10px] py-4 text-base text-[#2d2d2d]">
                        {user.name}
                      </TableCell>
                      <TableCell className="h-[52px] px-[10px] py-4 text-base text-[#2d2d2d]">
                        {user.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 5 && (
                <div className="flex h-[40px] items-center justify-between bg-gray-50 px-[10px]">
                  <Button
                    variant="link"
                    onClick={() => setShowAll(!showAll)}
                    className="h-auto p-0 text-sm font-medium text-[#DA3743]"
                  >
                    {showAll ? "Show Less" : "View All"}
                  </Button>
                  <span className="text-xs text-gray-500">
                    Showing first {displayedData.length} of {parsedData.length} rows
                  </span>
                </div>
              )}
            </div>

            {errors.length > 0 && (
              <div className="flex flex-col gap-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-500">
                    {error}
                  </p>
                ))}
              </div>
            )}

            <Button
              className="w-full bg-[#DA3743] hover:bg-[#DA3743]/90"
              onClick={handleSendInvitations}
              disabled={
                parsedData.length === 0 || errors.length > 0 || !userType || isPending
              }
            >
              {isPending ? "Sending..." : "Send Invitations"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
