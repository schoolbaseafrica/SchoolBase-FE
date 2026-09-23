"use client"

import { useQuery } from "@tanstack/react-query"
import { Clock3, FileQuestion, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PublicCbtAPI } from "@/lib/cbt"

export default function PublicCbtPage() {
  const exams = useQuery({
    queryKey: ["public-cbt", "exams"],
    queryFn: PublicCbtAPI.listExams,
  })
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="text-center">
          <Badge variant="secondary">Public assessments</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            External examinations
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Choose a published assessment. You will only need your name and email to
            begin.
          </p>
        </header>
        {exams.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((item) => (
              <Skeleton key={item} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : exams.isError ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-red-600">
              External examinations could not be loaded. Please try again.
            </CardContent>
          </Card>
        ) : !exams.data?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-slate-500">
              There are no external examinations open at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.data.map((exam) => (
              <Card key={exam.id} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{exam.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="line-clamp-3 text-sm text-slate-600">
                    {exam.instructions || "Read the instructions before beginning."}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {exam.timeLimitMinutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-4 w-4" />
                      {exam.questionCount ?? 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      {exam.proctoringMode === "none" ? "Not proctored" : "Proctored"}
                    </span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/cbt/${exam.id}`}>View and begin</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
