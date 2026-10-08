"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CircleAlert,
  GraduationCap,
  History,
  ShieldCheck,
  Wallet,
} from "lucide-react"

import { AcademicPeriodSelector } from "@/components/academic-period-selector"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { useAuthUser } from "@/hooks/use-auth-user"
import { AdminsAPI } from "@/lib/admins"
import { FeesAPI } from "@/lib/fees"
import { ActivityLogsAPI, activityActionLabel } from "@/lib/activity-logs"
import { formatNaira, toMoneyNumber } from "@/lib/format-money"

const scope = "owner-dashboard"

export default function OwnerOverviewPage() {
  const viewer = useAuthUser()
  const period = useAcademicPeriod(scope)
  const owner = useQuery({
    queryKey: ["first-school-owner"],
    queryFn: () => AdminsAPI.getFirstOwner(),
  })
  const isOwner = Boolean(
    viewer.data?.id && owner.data?.data.owner_user_id === viewer.data.id
  )
  const summary = useQuery({
    queryKey: ["owner-overview", period.sessionId, period.termId],
    queryFn: () =>
      AdminsAPI.getOwnerOverview({
        session_id: period.sessionId!,
        term_id: period.termId,
      }),
    enabled: isOwner && !!period.sessionId,
  })
  const fees = useQuery({
    queryKey: ["owner-fees", period.sessionId, period.termId],
    queryFn: () =>
      FeesAPI.getAnalytics({
        session_id: period.sessionId!,
        term_id: period.termId,
      }),
    enabled: isOwner && !!period.sessionId,
  })
  const activity = useQuery({
    queryKey: ["owner-recent-activity"],
    queryFn: () => ActivityLogsAPI.getAll({ page: 1, limit: 5 }),
    enabled: isOwner,
  })

  if (viewer.isLoading || owner.isLoading) {
    return (
      <div className="text-muted-foreground p-6 text-sm">Loading owner overview...</div>
    )
  }
  if (owner.isError || viewer.isError) {
    return (
      <div className="text-destructive p-6 text-sm">
        Unable to check school ownership.
      </div>
    )
  }
  if (!isOwner) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card className="p-6">
          <ShieldCheck className="text-accent size-7" />
          <h1 className="text-xl font-semibold">School owner access required</h1>
          <p className="text-muted-foreground text-sm">
            The assigned school owner can view this overview.
          </p>
          <Button asChild>
            <Link href="/admin">Go to admin dashboard</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const metrics = summary.data?.data
  const totals = fees.data?.data?.data?.totals
  const paid = toMoneyNumber(totals?.total_paid)
  const expected = toMoneyNumber(totals?.total_expected_fees)
  const collectionRate =
    expected > 0 ? Math.min(100, Math.round((paid / expected) * 100)) : 0
  const metricLoading = summary.isLoading || fees.isLoading || period.isLoading

  return (
    <div className="min-w-0 bg-[#FAFAFA] px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-accent text-sm font-semibold tracking-wide">SCHOOL OWNER</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">School overview</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            School performance and access in one place. Open a card to inspect its
            records.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/admin/operations">
            Operational dashboard <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <AcademicPeriodSelector scope={scope} />
      {(summary.isError || fees.isError) && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-xl border p-4 text-sm">
          Some figures could not be loaded. Refresh the page or inspect the linked
          records.
        </div>
      )}

      <section
        aria-label="School snapshot"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Enrolled students",
            value: metrics?.enrolled_students,
            icon: GraduationCap,
            href: "/admin/students",
            caption: "Selected session",
          },
          {
            label: "Fees collected",
            value: totals ? formatNaira(paid) : undefined,
            icon: Wallet,
            href: "/admin/fees-record",
            caption: "Selected period",
          },
          {
            label: "Outstanding fees",
            value: totals ? formatNaira(totals.outstanding_balance) : undefined,
            icon: CircleAlert,
            href: "/admin/fees-record",
            caption: "Selected period",
          },
          {
            label: "Results generated",
            value: metrics?.results_generated,
            icon: BookOpenCheck,
            href: "/admin/results",
            caption: "Selected period",
          },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="group min-w-0">
            <Card className="h-full gap-0 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="bg-accent/10 text-accent rounded-xl p-2.5">
                  <item.icon className="size-5" />
                </span>
                <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-muted-foreground mt-5 text-sm">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold break-words">
                {metricLoading ? "…" : (item.value ?? "—")}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">{item.caption}</p>
            </Card>
          </Link>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="min-w-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Fee collection</h2>
              <p className="text-muted-foreground text-sm">
                Paid against expected fees for the selected period
              </p>
            </div>
            <Link
              href="/admin/fees-record"
              className="text-accent text-sm font-medium hover:underline"
            >
              View report
            </Link>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-3xl font-semibold">
              {metricLoading ? "…" : `${collectionRate}%`}
            </span>
            <span className="text-muted-foreground text-sm">
              {formatNaira(paid)} of {formatNaira(expected)}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={collectionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fee collection rate"
            className="bg-accent/10 h-3 overflow-hidden rounded-full"
          >
            <div
              className="bg-accent h-full rounded-full"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <CalendarCheck2 className="text-accent size-5" />
            <h2 className="text-lg font-semibold">Attendance</h2>
          </div>
          <p className="text-muted-foreground text-sm">Records in the selected period</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-semibold">
                {metrics?.attendance_records ?? "—"}
              </p>
              <p className="text-muted-foreground text-xs">Total entries</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-semibold">
                {metrics?.absence_late_records ?? "—"}
              </p>
              <p className="text-muted-foreground text-xs">Absent or late</p>
            </div>
          </div>
          <Link
            href="/admin/attendance"
            className="text-accent mt-3 inline-flex text-sm font-medium hover:underline"
          >
            Inspect attendance <ArrowRight className="ml-1 size-4" />
          </Link>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="text-muted-foreground text-sm">
                {metrics?.recent_activity_events ?? "—"} events recorded in the last 24
                hours
              </p>
            </div>
            <History className="text-accent size-5" />
          </div>
          {activity.isError ? (
            <p className="text-destructive text-sm">Unable to load recent activity.</p>
          ) : (
            <div className="divide-y">
              {(activity.data?.data ?? []).map((event) => (
                <div key={event.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 break-words">
                    {event.description || activityActionLabel(event.action)}
                  </span>
                  <time
                    className="text-muted-foreground shrink-0 text-xs"
                    dateTime={event.created_at}
                  >
                    {new Date(event.created_at).toLocaleDateString("en-NG")}
                  </time>
                </div>
              ))}
              {!activity.isLoading && !activity.data?.data?.length && (
                <p className="text-muted-foreground py-4 text-sm">
                  No recent activity recorded.
                </p>
              )}
            </div>
          )}
          <Link
            href="/admin/activity-logs"
            className="text-accent text-sm font-medium hover:underline"
          >
            Open activity log <ArrowRight className="ml-1 inline size-4" />
          </Link>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent size-5" />
            <h2 className="text-lg font-semibold">School governance</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Owner-only account and audit controls
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-semibold">{metrics?.active_admins ?? "—"}</p>
              <p className="text-muted-foreground text-xs">Active admins</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-semibold">{metrics?.inactive_admins ?? "—"}</p>
              <p className="text-muted-foreground text-xs">Inactive admins</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/admins">Manage admins</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/settings">Audit retention</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
