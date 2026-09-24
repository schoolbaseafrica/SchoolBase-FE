"use client"

import { useQuery } from "@tanstack/react-query"
import { CircleCheck, Clock3, Search, UserCheck, Users } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CbtAPI } from "@/lib/cbt"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function CbtApplicantsPage() {
  const period = useAcademicPeriod("admin-cbt-applicants")
  const periodParams = {
    sessionId: period.sessionId,
    termId: period.termId,
    scope: period.isWholeSession ? ("session" as const) : ("term" as const),
  }
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const applicants = useQuery({
    queryKey: ["cbt", "applicants", periodParams],
    queryFn: () => CbtAPI.listApplicants(periodParams),
    enabled: !!period.sessionId,
  })
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (applicants.data ?? []).filter((item) => {
      const matchesSearch =
        !needle ||
        item.fullName.toLowerCase().includes(needle) ||
        item.email.toLowerCase().includes(needle) ||
        item.intakeName.toLowerCase().includes(needle) ||
        item.latestExamName?.toLowerCase().includes(needle)
      const applicantStatus = item.admittedAt
        ? "admitted"
        : item.hasPassed
          ? "passed"
          : item.hasPendingMarking
            ? "pending_marking"
            : item.attemptCount > item.completedAttemptCount
              ? "in_progress"
              : "review_required"
      return matchesSearch && (status === "all" || status === applicantStatus)
    })
  }, [applicants.data, search, status])

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium text-[var(--primary)]">CBT admissions</p>
          <h1 className="mt-1 text-3xl font-semibold">Applicants</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review external exam candidates and their latest assessment progress.
          </p>
        </header>
        <AcademicPeriodSelector scope="admin-cbt-applicants" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <Users className="h-8 w-8 text-[var(--primary)]" />
              <div>
                <p className="text-sm text-slate-500">Applicants</p>
                <p className="text-2xl font-semibold">{applicants.data?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <CircleCheck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Passed</p>
                <p className="text-2xl font-semibold">
                  {applicants.data?.filter((item) => item.hasPassed).length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <Clock3 className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-sm text-slate-500">In progress</p>
                <p className="text-2xl font-semibold">
                  {applicants.data?.filter(
                    (item) => item.attemptCount > item.completedAttemptCount
                  ).length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <UserCheck className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-slate-500">Admitted</p>
                <p className="text-2xl font-semibold">
                  {applicants.data?.filter((item) => item.admittedAt).length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Candidate records</CardTitle>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All applicants</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="pending_marking">Pending marking</SelectItem>
                  <SelectItem value="review_required">Review required</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-80">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, exam or intake"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {applicants.isLoading ? (
              <Skeleton className="h-48" />
            ) : applicants.isError ? (
              <div className="py-12 text-center text-sm text-red-600">
                Applicant records could not be loaded.
                <button className="ml-2 underline" onClick={() => applicants.refetch()}>
                  Try again
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-slate-500">
                    <tr>
                      <th className="py-3">Applicant</th>
                      <th>External exam</th>
                      <th>Latest attempt</th>
                      <th>Attempts</th>
                      <th>Best score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-4">
                          <Link
                            href={`/admin/cbt/applicants/${item.id}`}
                            className="font-medium text-[var(--primary)] hover:underline"
                          >
                            {item.fullName}
                          </Link>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </td>
                        <td>
                          <p>{item.latestExamName ?? "No attempt yet"}</p>
                          <p className="text-xs text-slate-500">
                            {item.sessionName}
                            {item.termName ? ` · ${item.termName}` : " · Whole session"}
                          </p>
                        </td>
                        <td>
                          <p>{new Date(item.latestAttemptAt).toLocaleDateString()}</p>
                        </td>
                        <td>{item.attemptCount}</td>
                        <td>
                          {item.bestPercentage === null ? "—" : `${item.bestPercentage}%`}
                        </td>
                        <td>
                          <Badge variant={item.admittedAt ? "default" : "secondary"}>
                            {item.admittedAt
                              ? "Admitted"
                              : item.hasPassed
                                ? "Passed"
                                : item.hasPendingMarking
                                  ? "Pending marking"
                                  : item.attemptCount > item.completedAttemptCount
                                    ? "In progress"
                                    : item.passMarkConfigured
                                      ? "Review required"
                                      : "Pass mark not set"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length && (
                  <p className="py-12 text-center text-sm text-slate-500">
                    No applicants found.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
