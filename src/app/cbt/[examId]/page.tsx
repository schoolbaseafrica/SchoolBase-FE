"use client"

import { FormEvent } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { PublicCbtAPI } from "@/lib/cbt"

export default function PublicCbtEntryPage() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  const exam = useQuery({
    queryKey: ["public-cbt", "exam", examId],
    queryFn: () => PublicCbtAPI.getExam(examId),
  })
  const start = useMutation({
    mutationFn: (candidate: { fullName: string; email: string; phone?: string }) =>
      PublicCbtAPI.startAttempt(examId, candidate),
    onSuccess: ({ accessToken, attempt }) => {
      sessionStorage.setItem(`cbt-token:${attempt.id}`, accessToken)
      router.push(`/cbt/attempt/${attempt.id}`)
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not start this examination"),
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    start.mutate({
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || "") || undefined,
    })
  }
  if (exam.isLoading)
    return (
      <main className="mx-auto max-w-2xl p-8">
        <Skeleton className="h-96 rounded-2xl" />
      </main>
    )
  if (!exam.data)
    return <main className="p-12 text-center">This examination is not available.</main>
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          href="/cbt"
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          All external exams
        </Link>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{exam.data.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-6 whitespace-pre-wrap text-slate-600">
              {exam.data.instructions ||
                "Read each question carefully before submitting."}
            </p>
            <div className="flex gap-5 rounded-xl bg-slate-50 p-4 text-sm">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {exam.data.timeLimitMinutes} minutes
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {exam.data.proctoringMode === "none"
                  ? "Not proctored"
                  : `${exam.data.proctoringMode} proctoring`}
              </span>
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number (optional)</Label>
                <Input id="phone" name="phone" />
              </div>
              <p className="text-xs text-slate-500">
                Your details create an applicant record so the school can review your
                result. No separate registration is required.
              </p>
              <Button className="w-full" disabled={start.isPending}>
                {start.isPending ? "Preparing examination…" : "Begin examination"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
