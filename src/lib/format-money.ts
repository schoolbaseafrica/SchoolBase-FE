export function toMoneyNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (!value) return 0
  const parsed = Number(value.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNaira(value: number | string | null | undefined): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value))
}

export function formatCompactNaira(value: number | string | null | undefined): string {
  const amount = toMoneyNumber(value)
  if (Math.abs(amount) < 1_000_000) return formatNaira(amount)
  return `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)}`
}
