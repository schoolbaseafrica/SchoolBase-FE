"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CheckCircle2, Clock3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useManualCheckIn } from "../_hooks/use-teacher-attendance"

interface ManualCheckInCardProps {
  hasCheckedIn: boolean
}

export default function ManualCheckInCard({ hasCheckedIn }: ManualCheckInCardProps) {
  const [reason, setReason] = useState("")
  const [now, setNow] = useState(() => new Date())
  const { mutate: checkIn, isPending } = useManualCheckIn()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    if (!reason.trim()) return
    const currentTime = new Date()
    checkIn(
      {
        date: format(currentTime, "yyyy-MM-dd"),
        check_in_time: format(currentTime, "HH:mm:ss"),
        reason: reason.trim(),
      },
      { onSuccess: () => setReason("") }
    )
  }

  return (
    <div className="portal-reveal rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-foreground text-base font-semibold">Your check-in</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Record your attendance for today.
          </p>
        </div>
        <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <Clock3 className="size-4" />
          {format(now, "EEEE, MMMM d, yyyy · h:mm a")}
        </span>
      </div>

      {hasCheckedIn ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <span>You have checked in for today.</span>
        </div>
      ) : (
        <div className="mt-5 max-w-2xl space-y-3">
          <Label htmlFor="teacher-checkin-reason">Reason for check-in</Label>
          <Textarea
            id="teacher-checkin-reason"
            placeholder="For example: On duty, meeting, or training"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="min-h-20 resize-y"
            disabled={isPending}
          />
          <Button onClick={handleCheckIn} disabled={!reason.trim() || isPending}>
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            {isPending ? "Checking in…" : "Check in"}
          </Button>
        </div>
      )}
    </div>
  )
}
