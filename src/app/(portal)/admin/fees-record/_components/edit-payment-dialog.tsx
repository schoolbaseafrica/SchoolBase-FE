"use client"

import React, { useMemo, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useActiveFees, useFeeStudents } from "../add-payment/_hooks/use-fees"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { useUpdatePayment } from "../_hooks/use-fee-payments"
import type { FeePayment } from "@/lib/fees"
import { XCircle } from "lucide-react"

const NIGERIAN_BANKS = [
  "Access Bank", "First Bank of Nigeria", "Guaranty Trust Bank (GTB)",
  "United Bank for Africa (UBA)", "Zenith Bank", "Ecobank Nigeria",
  "Fidelity Bank", "First City Monument Bank (FCMB)", "Union Bank of Nigeria",
  "Stanbic IBTC Bank", "Sterling Bank", "Wema Bank", "Polaris Bank",
  "Providus Bank", "Jaiz Bank", "Heritage Bank", "Keystone Bank", "TajBank", "Other",
]

const schema = z.object({
  feeComponent: z.string().optional(),
  studentId: z.string().optional(),
  description: z.string().optional(),
  bankName: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EditPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: FeePayment | null
  onSuccess?: () => void
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: EditPaymentDialogProps) {
  const updateMutation = useUpdatePayment(payment?.id ?? "")

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      feeComponent: "",
      studentId: "",
      description: "",
      bankName: "",
    },
  })

  const watchFee = form.watch("feeComponent")

  const { data: activeFeesData } = useActiveFees()
  const feeComponents = useMemo(() => {
    const raw = activeFeesData?.data?.data || []
    return raw.filter(
      (f): f is NonNullable<typeof f> =>
        f != null && typeof f === "object" && "id" in f && "name" in f
    )
  }, [activeFeesData?.data?.data])

  const { data: studentsData } = useFeeStudents(watchFee || undefined)
  const students = useMemo(() => {
    const raw = studentsData?.data?.data || []
    return raw.filter(
      (s): s is NonNullable<typeof s> =>
        s != null && typeof s === "object" && "id" in s && "name" in s
    )
  }, [studentsData?.data?.data])

  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  const selectedFee = feeComponents.find((f) => f.id === watchFee) ?? null
  const resolvedSessionId = useMemo(() => {
    if (payment?.session_id) return payment.session_id
    if (selectedFee?.session_id) return selectedFee.session_id
    const active = sessionsData?.data?.find((s) => s.isActive)
    return active?.id
  }, [payment?.session_id, selectedFee, sessionsData])

  const { data: sessionTerms } = useAcademicTermsForSession(resolvedSessionId)

  useEffect(() => {
    if (!open || !payment) return
    form.reset({
      feeComponent: payment.fee_component_id ?? "",
      studentId: payment.student_id ?? "",
      description: payment.description ?? "",
      bankName: payment.bank_name ?? "",
    })
  }, [open, payment, form])

  useEffect(() => {
    if (!watchFee) form.setValue("studentId", "")
  }, [watchFee, form])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!payment) return
    let termId: string | null = null
    if (values.feeComponent && selectedFee) {
      termId = selectedFee.term_id ?? null
      if (!termId && selectedFee.term && sessionTerms?.length) {
        const t = sessionTerms.find(
          (x) => x.name.toLowerCase().trim() === (selectedFee!.term || "").toLowerCase().trim()
        )
        if (t) termId = t.id
      }
    }

    const payload: Parameters<typeof updateMutation.mutateAsync>[0] = {}
    if (values.feeComponent !== undefined) payload.fee_component_id = values.feeComponent || null
    if (values.studentId !== undefined) payload.student_id = values.studentId || null
    if (values.feeComponent !== undefined) payload.term_id = termId
    if (values.description !== undefined) payload.description = values.description || null
    if (values.bankName !== undefined) payload.bank_name = values.bankName || null

    await updateMutation.mutateAsync(payload)
    onSuccess?.()
    onOpenChange(false)
  })

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        aria-describedby="edit-payment-description"
      >
        <DialogHeader>
          <DialogTitle>Edit / Reconcile Payment</DialogTitle>
          <DialogDescription id="edit-payment-description">
            Assign this payment to a student and fee, or update notes. Amount paid: ₦{Number(payment.amount_paid).toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fee (optional)</label>
            <div className="relative">
              <Controller
                control={form.control}
                name="feeComponent"
                render={({ field }) => (
                  <>
                    <Select
                      onValueChange={(v) => field.onChange(v || undefined)}
                      value={field.value || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeComponents.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name} – {f.session || ""} ({f.term || ""})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100"
                        aria-label="Clear fee"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Student (optional)</label>
            <div className="relative">
              <Controller
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <>
                    <Select
                      onValueChange={(v) => field.onChange(v || undefined)}
                      value={field.value || undefined}
                      disabled={!!watchFee && students.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            watchFee && !students.length
                              ? "No students for this fee"
                              : "Select student"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange(undefined)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100"
                        aria-label="Clear student"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bank (optional)</label>
            <Controller
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <Select
                  onValueChange={(v) => field.onChange(v || undefined)}
                  value={field.value || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_BANKS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description / notes (optional)</label>
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Admin notes"
                  className="min-h-[80px]"
                />
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
