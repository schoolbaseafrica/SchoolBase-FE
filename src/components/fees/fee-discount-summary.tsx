import type { StudentFeeDetailsResponse } from "@/lib/fees"

export function FeeDiscountSummary({ details }: { details: StudentFeeDetailsResponse }) {
  if (!details.totals?.discount) return null
  const { totals, discount } = details
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
      <h3 className="mb-2 font-semibold text-emerald-950">
        Discount on total school fees
      </h3>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="flex justify-between gap-4">
          <dt>Original fees</dt>
          <dd>₦{totals.original.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{discount ? `Code ${discount.code}` : "Applied discounts"}</dt>
          <dd>−₦{totals.discount.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4 font-semibold">
          <dt>Adjusted total</dt>
          <dd>₦{totals.adjusted.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Payments</dt>
          <dd>−₦{totals.paid.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4 font-semibold">
          <dt>Balance due</dt>
          <dd>₦{totals.outstanding.toLocaleString()}</dd>
        </div>
      </dl>
      {discount?.status === "PENDING_REVIEW" && (
        <p className="mt-2 text-amber-800">
          A change to this bill is awaiting admin review. The current discount remains in
          effect.
        </p>
      )}
    </div>
  )
}
