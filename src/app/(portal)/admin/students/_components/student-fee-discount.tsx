"use client"

import { useCallback, useEffect, useState } from "react"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewFeatureBadge } from "@/components/ui/new-feature-badge"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import type { StudentFeeDetailsResponse } from "@/lib/fees"
import { toast } from "sonner"

export function StudentFeeDiscount({
  studentId,
  sessionId,
  termId,
}: {
  studentId: string
  sessionId?: string
  termId?: string
}) {
  const period = useAcademicPeriod("admin-student-discount")
  const queryClient = useQueryClient()
  const selectedSessionId = sessionId ?? period.sessionId
  const selectedTermId = termId ?? period.termId
  const [details, setDetails] = useState<StudentFeeDetailsResponse | null>(null)
  const [code, setCode] = useState("")
  const [preview, setPreview] = useState<{
    original: number
    discount: number
    adjusted: number
    paid: number
    balance: number
  } | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!selectedSessionId || !selectedTermId) return
    try {
      const response = await apiFetch<{ data: StudentFeeDetailsResponse }>(
        `/fees/student/${studentId}?session_id=${selectedSessionId}&term_id=${selectedTermId}`
      )
      setDetails(response.data)
    } catch {
      setDetails(null)
      toast.error("Could not load this student's fees")
    }
  }, [studentId, selectedSessionId, selectedTermId])

  useEffect(() => {
    setPreview(null)
    void refresh()
  }, [refresh])

  const apply = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSessionId || !selectedTermId || !preview) return
    setBusy(true)
    try {
      await apiFetch("/fee-discounts/apply", {
        method: "POST",
        data: {
          code,
          student_id: studentId,
          session_id: selectedSessionId,
          term_id: selectedTermId,
        },
      })
      toast.success("Discount applied to student's total bill")
      setCode("")
      setPreview(null)
      await refresh()
      await queryClient.invalidateQueries({
        queryKey: ["student-fee-details", studentId],
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply discount")
    } finally {
      setBusy(false)
    }
  }

  const previewCode = async () => {
    if (!selectedSessionId || !selectedTermId || !code.trim()) return
    setBusy(true)
    try {
      const params = new URLSearchParams({
        code,
        student_id: studentId,
        session_id: selectedSessionId,
        term_id: selectedTermId,
      })
      const response = await apiFetch<{ data: NonNullable<typeof preview> }>(
        `/fee-discounts/preview?${params}`
      )
      setPreview(response.data)
    } catch (error) {
      setPreview(null)
      toast.error(error instanceof Error ? error.message : "Could not preview discount")
    } finally {
      setBusy(false)
    }
  }

  const revoke = async () => {
    if (!details?.discount) return
    const reason = window.prompt("Reason for revoking this student's discount")
    if (!reason?.trim()) return
    setBusy(true)
    try {
      await apiFetch(`/fee-discounts/redemptions/${details.discount.id}/revoke`, {
        method: "PATCH",
        data: { reason: reason.trim() },
      })
      toast.success("Discount revoked; its audit history is retained")
      await refresh()
      await queryClient.invalidateQueries({
        queryKey: ["student-fee-details", studentId],
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not revoke discount")
    } finally {
      setBusy(false)
    }
  }

  const totals = details?.totals
  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <h3 className="font-semibold">
          Student fee discount <NewFeatureBadge />
        </h3>
        <p className="text-sm text-gray-600">
          Apply one code to this student&apos;s total bill for the selected term.
        </p>
      </div>
      {!sessionId && !termId && (
        <AcademicPeriodSelector
          scope="admin-student-discount"
          allowWholeSession={false}
        />
      )}
      {totals && (
        <div className="grid gap-2 text-sm sm:grid-cols-5">
          <span>Original: ₦{totals.original.toLocaleString()}</span>
          <span>Discount: −₦{totals.discount.toLocaleString()}</span>
          <span>Adjusted: ₦{totals.adjusted.toLocaleString()}</span>
          <span>Paid: ₦{totals.paid.toLocaleString()}</span>
          <strong>Balance: ₦{totals.outstanding.toLocaleString()}</strong>
        </div>
      )}
      {details?.discount ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p>
            Code <strong>{details.discount.code}</strong> applied.
            {details.discount.status === "PENDING_REVIEW" &&
              " A bill change is awaiting admin review."}
            {details.discount.status !== "PENDING_REVIEW" &&
              " Revoke it before applying another code for this term."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void revoke()}
          >
            Revoke discount
          </Button>
        </div>
      ) : (
        <form onSubmit={apply} className="flex max-w-lg gap-2">
          <Input
            aria-label="Fee discount code"
            placeholder="Discount code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setPreview(null)
            }}
            required
          />
          {preview ? (
            <Button type="submit" disabled={busy}>
              Confirm discount
            </Button>
          ) : (
            <Button
              type="button"
              disabled={busy || !selectedSessionId || !selectedTermId}
              onClick={() => void previewCode()}
            >
              Preview
            </Button>
          )}
        </form>
      )}
      {preview && !details?.discount && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p>
            Original ₦{preview.original.toLocaleString()} − discount ₦
            {preview.discount.toLocaleString()} = adjusted total ₦
            {preview.adjusted.toLocaleString()}
          </p>
          <p>
            Already paid ₦{preview.paid.toLocaleString()} · New balance ₦
            {preview.balance.toLocaleString()}
          </p>
        </div>
      )}
    </section>
  )
}
