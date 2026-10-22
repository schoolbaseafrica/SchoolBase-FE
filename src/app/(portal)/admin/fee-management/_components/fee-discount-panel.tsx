"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewFeatureBadge } from "@/components/ui/new-feature-badge"
import { toast } from "sonner"

type Code = {
  id: string
  code: string
  kind: "PERCENT" | "AMOUNT"
  value: string
  uses: number
  max_uses: number | null
  expires_at: string | null
  is_active: boolean
}

type Review = {
  id: string
  student_id: string
  student_name: string
  registration_number: string
  applied_by: string
  code: string
  old_base_total: string
  proposed_base_total: string
  old_discount_amount: string
  proposed_discount_amount: string
}

export function FeeDiscountPanel({
  sessionId,
  termId,
}: {
  sessionId?: string
  termId?: string
}) {
  const [codes, setCodes] = useState<Code[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [code, setCode] = useState("")
  const [kind, setKind] = useState<"PERCENT" | "AMOUNT">("PERCENT")
  const [value, setValue] = useState("")
  const [expiry, setExpiry] = useState("")
  const [limit, setLimit] = useState("")
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!sessionId || !termId) return
    try {
      const [nextCodes, nextReviews] = await Promise.all([
        apiFetch<{ data: Code[] }>(
          `/fee-discounts/codes?session_id=${sessionId}&term_id=${termId}`
        ),
        apiFetch<{ data: Review[] }>("/fee-discounts/reviews"),
      ])
      setCodes(nextCodes.data)
      setReviews(nextReviews.data)
    } catch {
      toast.error("Could not load fee discounts")
    }
  }, [sessionId, termId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const generate = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(5))
    setCode(
      `DISC-${Array.from(bytes, (item) => item.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`
    )
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!sessionId || !termId) return
    setBusy(true)
    try {
      await apiFetch("/fee-discounts/codes", {
        method: "POST",
        data: {
          code,
          kind,
          value: Number(value),
          session_id: sessionId,
          term_id: termId,
          ...(expiry ? { expires_at: new Date(expiry).toISOString() } : {}),
          ...(limit ? { max_uses: Number(limit) } : {}),
        },
      })
      toast.success("Discount code created")
      setCode("")
      setValue("")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create code")
    } finally {
      setBusy(false)
    }
  }

  const decide = async (review: Review, approve: boolean) => {
    const reason = window.prompt(
      approve
        ? "Reason for approving this discount change"
        : "Reason for rejecting this change"
    )
    if (!reason?.trim()) return
    setBusy(true)
    try {
      await apiFetch(`/fee-discounts/reviews/${review.id}`, {
        method: "PATCH",
        data: { approve, reason: reason.trim() },
      })
      toast.success(approve ? "Discount change approved" : "Discount change rejected")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review discount")
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async (item: Code) => {
    const reason = window.prompt(`Reason for deactivating ${item.code}`)
    if (!reason?.trim()) return
    setBusy(true)
    try {
      await apiFetch(`/fee-discounts/codes/${item.id}/deactivate`, {
        method: "PATCH",
        data: { reason: reason.trim() },
      })
      toast.success("Code deactivated; existing student discounts remain")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not deactivate code")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-5 rounded-xl border bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">
          Student bill discounts <NewFeatureBadge />
        </h2>
        <p className="text-sm text-gray-600">
          Create a code for the selected term. Apply it to a student from their profile.
        </p>
      </div>
      <form onSubmit={create} className="grid gap-3 md:grid-cols-6">
        <div className="flex gap-2 md:col-span-2">
          <Input
            aria-label="Discount code"
            placeholder="Code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            required
          />
          <Button type="button" variant="outline" onClick={generate}>
            Generate
          </Button>
        </div>
        <select
          aria-label="Discount type"
          className="rounded-md border px-3"
          value={kind}
          onChange={(event) => setKind(event.target.value as "PERCENT" | "AMOUNT")}
        >
          <option value="PERCENT">Percent</option>
          <option value="AMOUNT">Amount (₦)</option>
        </select>
        <Input
          aria-label="Discount value"
          type="number"
          min="0.01"
          max={kind === "PERCENT" ? "100" : undefined}
          step="0.01"
          placeholder="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
        <Input
          aria-label="Expiry date"
          type="date"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
        />
        <Input
          aria-label="Maximum uses"
          type="number"
          min="1"
          placeholder="Use limit (optional)"
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
        />
        <Button type="submit" disabled={busy || !sessionId || !termId}>
          Create code
        </Button>
      </form>
      <div className="space-y-2">
        <h3 className="font-medium">Codes for this term</h3>
        {codes.length ? (
          codes.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap justify-between gap-2 rounded-md border p-3 text-sm"
            >
              <strong className="font-mono">{item.code}</strong>
              <span>
                {item.value}
                {item.kind === "PERCENT" ? "%" : " ₦"} off total bill
              </span>
              <span>
                {item.uses}/{item.max_uses ?? "∞"} uses
              </span>
              {item.is_active ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void deactivate(item)}
                >
                  Deactivate
                </Button>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No discount codes for this term.</p>
        )}
      </div>
      {reviews.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Discount changes awaiting review</h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-md border border-amber-300 p-3 text-sm"
            >
              <p>
                <strong>{review.code}</strong> · {review.student_name} (
                {review.registration_number})
              </p>
              <p>
                Bill: ₦{Number(review.old_base_total).toLocaleString()} → ₦
                {Number(review.proposed_base_total).toLocaleString()}
              </p>
              <p>
                Discount: ₦{Number(review.old_discount_amount).toLocaleString()} → ₦
                {Number(review.proposed_discount_amount).toLocaleString()}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => void decide(review, true)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void decide(review, false)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
