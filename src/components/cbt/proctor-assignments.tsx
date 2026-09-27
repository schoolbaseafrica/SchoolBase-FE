"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CbtAPI } from "@/lib/cbt"
import { TeachersAPI } from "@/lib/teachers"
import type { SnakeUser } from "@/types/user"

export function ProctorAssignments({
  examId,
  classes,
}: {
  examId: string
  classes: Array<{ id: string; name: string; arm?: string }>
}) {
  const client = useQueryClient()
  const [teacherId, setTeacherId] = useState("")
  const [classIds, setClassIds] = useState<string[]>([])
  const assignments = useQuery({
    queryKey: ["cbt", "proctors", examId],
    queryFn: () => CbtAPI.listExamProctors(examId),
  })
  const teachersQuery = useQuery({
    queryKey: ["cbt", "proctor-teachers"],
    queryFn: () => TeachersAPI.getAll({ limit: 100, is_active: true }),
  })
  const teachers = useMemo(() => {
    const value = teachersQuery.data?.data as unknown
    if (
      value &&
      typeof value === "object" &&
      "data" in value &&
      Array.isArray((value as { data: unknown }).data)
    )
      return (value as { data: SnakeUser[] }).data
    return Array.isArray(value) ? (value as SnakeUser[]) : []
  }, [teachersQuery.data])
  const refresh = () =>
    void client.invalidateQueries({ queryKey: ["cbt", "proctors", examId] })
  const assign = useMutation({
    mutationFn: () => CbtAPI.assignExamProctor(examId, { teacherId, classIds }),
    onSuccess: () => {
      refresh()
      setTeacherId("")
      setClassIds([])
      toast.success("Proctor assignment saved")
    },
    onError: (error: Error) => toast.error(error.message || "Could not assign proctor"),
  })
  const remove = useMutation({
    mutationFn: (id: string) => CbtAPI.removeExamProctor(examId, id),
    onSuccess: () => {
      refresh()
      toast.success("Proctor removed")
    },
  })

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Proctors</h2>
        <p className="text-sm text-slate-500">
          Grant a teacher monitoring access to selected examination classes.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
          >
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name} · {teacher.email}
              </option>
            ))}
          </select>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 rounded-md border p-3 text-sm"
              >
                <Checkbox
                  checked={classIds.includes(item.id)}
                  onCheckedChange={(checked) =>
                    setClassIds((current) =>
                      checked
                        ? [...current, item.id]
                        : current.filter((id) => id !== item.id)
                    )
                  }
                />
                {item.name}
                {item.arm ? ` ${item.arm}` : ""}
              </label>
            ))}
          </div>
          <Button
            disabled={!teacherId || !classIds.length || assign.isPending}
            onClick={() => assign.mutate()}
          >
            Assign proctor
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {assignments.data?.map((item) => (
          <Card key={item.userId}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-slate-500">{item.email}</p>
                <p className="mt-2 text-sm">
                  {item.classes
                    .map((entry) => `${entry.name}${entry.arm ? ` ${entry.arm}` : ""}`)
                    .join(", ")}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => remove.mutate(item.userId)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
