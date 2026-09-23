"use client"

import { CalendarRange, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAcademicPeriod } from "@/hooks/use-academic-period"

export function AcademicPeriodSelector({
  scope,
  sessionOnly = false,
  allowWholeSession = true,
}: {
  scope: string
  sessionOnly?: boolean
  allowWholeSession?: boolean
}) {
  const period = useAcademicPeriod(scope)

  return (
    <div className="my-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-3 shadow-sm">
      <div className="mr-1 flex items-center gap-2 self-center text-sm font-semibold">
        <CalendarRange className="text-accent size-4" />
        Viewing
      </div>
      <label className="text-muted-foreground grid min-w-[180px] gap-1 text-xs">
        Academic session
        <Select
          value={period.sessionId ?? undefined}
          onValueChange={period.setSession}
          disabled={period.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {period.sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
                {session.id === period.activeSession?.id ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      {!sessionOnly && (
        <label className="text-muted-foreground grid min-w-[180px] gap-1 text-xs">
          Academic term
          <Select
            value={period.termSelection}
            onValueChange={period.setTerm}
            disabled={period.isLoading || !period.sessionId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {allowWholeSession && <SelectItem value="all">Whole session</SelectItem>}
              {period.terms.map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                  {term.id === period.activeTerm?.id ? " (current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
      <Button variant="outline" size="sm" onClick={period.reset} className="gap-2">
        <RotateCcw className="size-4" /> Current period
      </Button>
      {sessionOnly && (
        <p className="text-muted-foreground self-center text-xs">
          Class structures are maintained per academic session.
        </p>
      )}
    </div>
  )
}
