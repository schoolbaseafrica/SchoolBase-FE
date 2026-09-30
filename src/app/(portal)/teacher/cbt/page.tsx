"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ClipboardCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CbtAPI } from "@/lib/cbt"

export default function TeacherCbtPage() {
  const exams = useQuery({
    queryKey: ["cbt", "proctor", "exams"],
    queryFn: CbtAPI.listProctorExams,
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Exam monitoring</h1>
        <p className="text-sm text-slate-500">
          Monitor candidates only for examinations and classes assigned to you.
        </p>
      </div>
      {exams.isError && (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            {exams.error instanceof Error
              ? exams.error.message
              : "Assigned examinations could not be loaded."}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exams.data?.map((exam) => (
          <Card key={exam.id} className="rounded-xl">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{exam.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {exam.classes
                      .map((item) => `${item.name}${item.arm ? ` ${item.arm}` : ""}`)
                      .join(", ")}
                  </p>
                </div>
                <Badge variant="outline">{exam.status}</Badge>
              </div>
              <Button asChild className="w-full">
                <Link href={`/teacher/cbt/${exam.id}`}>Open live monitor</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {!exams.isLoading && !exams.isError && !exams.data?.length && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-slate-400" />
            <p className="font-medium">No monitoring assignments</p>
            <p className="text-sm text-slate-500">
              An administrator can assign you to an internal examination and specific
              classes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
