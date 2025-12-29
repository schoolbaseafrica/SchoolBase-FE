// lib/utils/activity-status.ts
type ActivityStatus = "completed" | "ongoing" | "pending" | string

export function getActivityStatusStyles(status: ActivityStatus): string {
  const normalizedStatus = status.toLowerCase()

  const statusStyles: Record<string, string> = {
    completed: "bg-[#D1FADF] text-[#10B981]",
    ongoing: "bg-[#F42C2C]/10 text-[#F42C2C]",
    pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  }

  return `rounded-2xl px-2.5 py-0.5 text-sm font-medium w-fit ${
    statusStyles[normalizedStatus] || statusStyles.pending
  }`
}
