"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useCreateFee } from "../_hooks/use-fees"
import type { FeeComponent } from "@/lib/fees-management"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { Copy } from "lucide-react"

const copyFeeSchema = z
  .object({
    period_type: z.enum(["TERM", "SESSION"]),
    session_id: z.string().uuid().optional(),
    term_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.period_type === "TERM") {
        return !!data.term_id
      }
      return !!data.session_id
    },
    {
      message: "Please select a term or session",
    }
  )

type CopyFeeFormValues = z.infer<typeof copyFeeSchema>

interface CopyFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee: FeeComponent | null
  onSuccess?: () => void
}

export function CopyFeeDialog({ open, onOpenChange, fee, onSuccess }: CopyFeeDialogProps) {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const createMutation = useCreateFee()

  const form = useForm<CopyFeeFormValues>({
    resolver: zodResolver(copyFeeSchema),
    defaultValues: {
      period_type: "TERM",
      session_id: undefined,
      term_id: undefined,
    },
  })

  // Sessions
  const { data: sessions } = useAcademicSessions()

  // Terms for selected session
  const { data: terms } = useAcademicTermsForSession(selectedSession)

  const periodType = form.watch("period_type")

  // Reset form when dialog opens
  useEffect(() => {
    if (open && fee) {
      form.reset({
        period_type: fee.period_type || "TERM",
        session_id: undefined,
        term_id: undefined,
      })
      setSelectedSession("")
    }
  }, [open, fee, form])

  // Reset term/session when period type changes
  useEffect(() => {
    if (periodType === "TERM") {
      form.setValue("session_id", undefined)
    } else {
      form.setValue("term_id", undefined)
      setSelectedSession("")
    }
  }, [periodType, form])

  // Reset term when session changes
  useEffect(() => {
    if (selectedSession && periodType === "TERM") {
      form.setValue("term_id", undefined)
    }
  }, [selectedSession, periodType, form])

  const onSubmit = async (values: CopyFeeFormValues) => {
    if (!fee) return

    await createMutation.mutateAsync({
      component_name: fee.component_name,
      description: fee.description || undefined,
      amount: Number(fee.amount),
      period_type: values.period_type,
      term_id: values.period_type === "TERM" ? values.term_id : undefined,
      session_id: values.period_type === "SESSION" ? values.session_id : undefined,
      class_ids: fee.classes?.map((c) => c.id) || [],
    })

    onSuccess?.()
    onOpenChange(false)
  }

  if (!fee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy Fee to New Period
          </DialogTitle>
          <DialogDescription>
            Copy "{fee.component_name}" to a new term or session. The fee details and class
            assignments will be copied.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Original Fee Info */}
          <div className="rounded-md border bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-900">Original Fee</p>
            <p className="mt-1 text-sm font-semibold text-blue-900">{fee.component_name}</p>
            <p className="mt-1 text-xs text-blue-700">
              {fee.period_type === "SESSION" ? "Per Session" : "Per Term"} • ₦
              {Number(fee.amount).toLocaleString()}
              {fee.classes && fee.classes.length > 0 && (
                <> • {fee.classes.length} class{fee.classes.length > 1 ? "es" : ""}</>
              )}
            </p>
          </div>

          {/* Period Type */}
          <div className="space-y-1">
            <Label>Copy to Period Type</Label>
            <Select
              value={periodType}
              onValueChange={(value: "TERM" | "SESSION") => {
                form.setValue("period_type", value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TERM">Per Term</SelectItem>
                <SelectItem value="SESSION">Per Session</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {periodType === "TERM"
                ? "Copy fee to a specific term"
                : "Copy fee to an entire academic session"}
            </p>
          </div>

          {/* Session - For TERM period type */}
          {periodType === "TERM" && (
            <div className="space-y-1">
              <Label>Academic Session</Label>
              {sessions?.data?.length ? (
                <Select
                  value={selectedSession}
                  onValueChange={(value) => {
                    setSelectedSession(value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.data.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No sessions available</p>
              )}
            </div>
          )}

          {/* Term - Only shown when period_type is TERM */}
          {periodType === "TERM" && (
            <div className="space-y-1">
              <Label>Term</Label>
              {!selectedSession ? (
                <p className="text-sm text-gray-500">Please select a session first</p>
              ) : terms && terms.length > 0 ? (
                <Select
                  value={form.watch("term_id") || ""}
                  onValueChange={(value) => form.setValue("term_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No terms available for this session</p>
              )}
              {form.formState.errors.term_id && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.term_id.message}
                </p>
              )}
            </div>
          )}

          {/* Session - Only shown when period_type is SESSION */}
          {periodType === "SESSION" && (
            <div className="space-y-1">
              <Label>Academic Session</Label>
              {sessions?.data?.length ? (
                <Select
                  value={form.watch("session_id") || ""}
                  onValueChange={(value) => form.setValue("session_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.data.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No sessions available</p>
              )}
              {form.formState.errors.session_id && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.session_id.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Copying..." : "Copy Fee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
