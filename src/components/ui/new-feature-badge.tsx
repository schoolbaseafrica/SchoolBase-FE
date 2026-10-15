import { cn } from "@/lib/utils"

export function NewFeatureBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "new-feature-badge inline-flex shrink-0 items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] leading-4 font-semibold tracking-wide text-emerald-800",
        className
      )}
    >
      New
    </span>
  )
}
