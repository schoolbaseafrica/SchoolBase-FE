"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CbtAPI } from "@/lib/cbt"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
import { AcademicPeriodSelector } from "@/components/academic-period-selector"

export default function ApplicantDetailPage() {
  const { applicantId } = useParams<{ applicantId: string }>()
  const period = useAcademicPeriod("admin-cbt-applicants")
  const periodParams = {
    sessionId: period.sessionId,
    termId: period.termId,
    scope: period.isWholeSession ? ("session" as const) : ("term" as const),
  }
  const queryClient = useQueryClient()
  const applicant = useQuery({
    queryKey: ["cbt", "applicant", applicantId, periodParams],
    queryFn: () => CbtAPI.getApplicant(applicantId, periodParams),
    enabled: !!applicantId && !!period.sessionId,
  })
  const admit = useMutation({
    mutationFn: () => CbtAPI.admitApplicant(applicantId, periodParams),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cbt", "applicant", applicantId] }),
        queryClient.invalidateQueries({ queryKey: ["cbt", "applicants"] }),
      ])
      toast.success(
        result.outcome === "linked_existing_student"
          ? "Applicant linked to the existing student profile"
          : result.outcome === "student_profile_exists"
            ? "Applicant already has a student profile"
            : "Applicant approved and student access invitation sent"
      )
    },
    onError: (error: Error) =>
      toast.error(error.message || "Applicant could not be admitted"),
  })
  if (applicant.isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-96" />
      </div>
    )
  if (applicant.isError)
    return (
      <div className="p-8 text-center text-sm text-red-600">
        Applicant details could not be loaded.
        <button className="ml-2 underline" onClick={() => applicant.refetch()}>
          Try again
        </button>
      </div>
    )
  if (!applicant.data) return <div className="p-8">Applicant not found.</div>
  const passed = applicant.data.attempts.some(
    (attempt) =>
      attempt.status === "submitted" &&
      !attempt.manualGradingRequired &&
      attempt.percentage !== null &&
      attempt.exam.passMarkPercent !== null &&
      attempt.percentage >= attempt.exam.passMarkPercent
  )
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/admin/cbt/applicants"
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Applicants
        </Link>
        <AcademicPeriodSelector scope="admin-cbt-applicants" />
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>{applicant.data.fullName}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{applicant.data.intake.name}</p>
            </div>
            <Badge variant={applicant.data.admittedAt ? "default" : "secondary"}>
              {applicant.data.admittedAt ? "Admitted" : "Applicant"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {applicant.data.email}
              </span>
              {applicant.data.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {applicant.data.phone}
                </span>
              )}
            </div>
            {!applicant.data.admittedAt && (
              <Button
                disabled={!passed || admit.isPending}
                onClick={() => admit.mutate()}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve and start student onboarding
              </Button>
            )}
            {!passed && !applicant.data.admittedAt && (
              <p className="text-xs text-amber-700">
                Approval becomes available after a completed passing result.
              </p>
            )}
          </CardContent>
        </Card>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">External exam history</h2>
          {applicant.data.attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="grid items-center gap-4 p-5 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <p className="font-medium">{attempt.exam.name}</p>
                  <p className="text-xs text-slate-500">
                    Started {new Date(attempt.startedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Result</p>
                  <p className="font-semibold">
                    {attempt.percentage === null ? "Pending" : `${attempt.percentage}%`}
                  </p>
                </div>
                <div>
                  {attempt.status === "submitted" && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/cbt/attempts/${attempt.id}`}>
                        {attempt.manualGradingRequired ? "Mark answers" : "Review"}
                      </Link>
                    </Button>
                  )}
                </div>
                <div>
                  <Badge
                    variant={attempt.status === "submitted" ? "default" : "secondary"}
                  >
                    {attempt.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {applicant.data.attempts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                This applicant has not started an external examination.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}
