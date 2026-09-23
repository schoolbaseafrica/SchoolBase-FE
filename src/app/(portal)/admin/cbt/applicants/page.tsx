"use client"

import { useQuery } from "@tanstack/react-query"
import { Search, UserCheck, Users } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CbtAPI } from "@/lib/cbt"

export default function CbtApplicantsPage() {
  const [search, setSearch] = useState("")
  const applicants = useQuery({
    queryKey: ["cbt", "applicants"],
    queryFn: CbtAPI.listApplicants,
  })
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return applicants.data ?? []
    return (applicants.data ?? []).filter(
      (item) =>
        item.fullName.toLowerCase().includes(needle) ||
        item.email.toLowerCase().includes(needle) ||
        item.intakeName.toLowerCase().includes(needle)
    )
  }, [applicants.data, search])

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
        <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="relative w-full sm:w-80">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or intake"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {applicants.isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-slate-500">
                    <tr>
                      <th className="py-3">Applicant</th>
                      <th>External exam</th>
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
                        <td>{item.intakeName}</td>
                        <td>{item.attemptCount}</td>
                        <td>{item.bestScore ?? "—"}</td>
                        <td>
                          <Badge variant={item.admittedAt ? "default" : "secondary"}>
                            {item.admittedAt ? "Admitted" : "Applicant"}
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
