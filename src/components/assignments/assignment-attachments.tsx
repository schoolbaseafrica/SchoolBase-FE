"use client"

import { ChangeEvent, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Download, Loader2, Paperclip, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { useAuthUser } from "@/hooks/use-auth-user"
import { AssignmentAPI } from "@/lib/assignments"
import { Button } from "@/components/ui/button"

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

export function AssignmentAttachments({
  assignmentId,
  canUpload,
  studentId,
}: {
  assignmentId: string
  canUpload: boolean
  studentId?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const auth = useAuthUser()
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<number | null>(null)
  const key = ["assignment-attachments", assignmentId, studentId]
  const attachments = useQuery({
    queryKey: key,
    queryFn: () => AssignmentAPI.attachments(assignmentId, studentId),
  })
  const upload = useMutation({
    mutationFn: (file: File) =>
      AssignmentAPI.uploadAttachment(assignmentId, file, setProgress),
    onSuccess: () => {
      setProgress(null)
      void queryClient.invalidateQueries({ queryKey: key })
      toast.success("File attached")
    },
    onError: (error: Error) => {
      setProgress(null)
      toast.error(error.message || "File upload failed")
    },
  })
  const remove = useMutation({
    mutationFn: (attachmentId: string) =>
      AssignmentAPI.deleteAttachment(assignmentId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      toast.success("Attachment removed")
    },
    onError: (error: Error) => toast.error(error.message || "Could not remove file"),
  })
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Files must be 10 MB or smaller")
      return
    }
    upload.mutate(file)
  }

  return (
    <div className="space-y-2 rounded-xl border bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="h-4 w-4" /> Attachments
        </div>
        {canUpload && (
          <>
            <input
              ref={input}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/jpeg,image/png,image/webp"
              onChange={choose}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={upload.isPending}
              onClick={() => input.current?.click()}
            >
              {upload.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {progress === null ? "Attach file" : `${progress}%`}
            </Button>
          </>
        )}
      </div>
      {attachments.isLoading ? (
        <p className="text-muted-foreground text-xs">Loading files…</p>
      ) : attachments.data?.length ? (
        <div className="space-y-1">
          {attachments.data.map((attachment) => {
            const owner = attachment.student
              ? `${attachment.student.user?.first_name ?? ""} ${attachment.student.user?.last_name ?? ""}`.trim() ||
                attachment.student.registration_number
              : "Teacher resource"
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
              >
                <a
                  href={AssignmentAPI.attachmentDownloadUrl(
                    assignmentId,
                    attachment.id,
                    studentId
                  )}
                  className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span className="truncate">{attachment.originalName}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatSize(attachment.size)} · {owner}
                  </span>
                </a>
                {attachment.uploadedBy === auth.data?.id && (
                  <button
                    type="button"
                    aria-label={`Remove ${attachment.originalName}`}
                    onClick={() => remove.mutate(attachment.id)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">No files attached.</p>
      )}
      <p className="text-muted-foreground text-xs">
        PDF, Office, text or image files up to 10 MB each.
      </p>
    </div>
  )
}
