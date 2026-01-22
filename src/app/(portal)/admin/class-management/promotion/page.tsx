"use client"

import { useState, useMemo } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAcademicSessions } from "../session/_hooks/use-session"
import { useGetClassesInfo } from "../_hooks/use-classes"
import { usePromotionPreview, usePromotionExecute } from "../_hooks/use-classes"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ClassItem } from "@/lib/classes"

type MappingRow = { sourceClassId: string; targetClassId: string }

function classLabel(cls: { id: string; arm?: string }, name: string) {
  return `${name}${cls.arm ? ` ${cls.arm}` : ""}`.trim()
}

export default function PromotionPage() {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  const { data: classesData } = useGetClassesInfo({ includeArchived: false })
  const previewMutation = usePromotionPreview()
  const executeMutation = usePromotionExecute()

  const [sourceSessionId, setSourceSessionId] = useState<string>("")
  const [targetSessionId, setTargetSessionId] = useState<string>("")
  const [mappings, setMappings] = useState<MappingRow[]>([])

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData])
  const allClasses = useMemo(() => classesData?.items ?? [], [classesData])

  const sourceClasses = useMemo(() => {
    return allClasses.filter((g) => g.academicSession?.id === sourceSessionId)
  }, [allClasses, sourceSessionId])

  const targetClasses = useMemo(() => {
    return allClasses.filter((g) => g.academicSession?.id === targetSessionId)
  }, [allClasses, targetSessionId])

  const flatSourceClasses = useMemo(() => {
    return sourceClasses.flatMap((g) =>
      g.classes.map((c) => ({ ...c, groupName: g.name }))
    )
  }, [sourceClasses])

  const flatTargetClasses = useMemo(() => {
    return targetClasses.flatMap((g) =>
      g.classes.map((c) => ({ ...c, groupName: g.name }))
    )
  }, [targetClasses])

  const addMapping = () => {
    const firstSource = flatSourceClasses[0]
    const firstTarget = flatTargetClasses[0]
    if (!firstSource || !firstTarget) {
      toast.error("Select source and target sessions with at least one class each.")
      return
    }
    setMappings((prev) => [
      ...prev,
      { sourceClassId: firstSource.id, targetClassId: firstTarget.id },
    ])
  }

  const removeMapping = (i: number) => {
    setMappings((prev) => prev.filter((_, idx) => idx !== i))
  }

  const updateMapping = (i: number, field: "sourceClassId" | "targetClassId", value: string) => {
    setMappings((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    )
  }

  const canPreview = sourceSessionId && targetSessionId && sourceSessionId !== targetSessionId && mappings.length > 0
  const previewPayload = useMemo(
    () => ({
      sourceSessionId,
      targetSessionId,
      armMappings: mappings,
    }),
    [sourceSessionId, targetSessionId, mappings]
  )

  const handlePreview = async () => {
    if (!canPreview) return
    try {
      const res = await previewMutation.mutateAsync(previewPayload)
      const totalToPromote = res.mappings.reduce((s, m) => s + m.toPromote, 0)
      const totalSkip = res.mappings.reduce((s, m) => s + m.alreadyInTarget, 0)
      const errs = res.mappings.flatMap((m) => m.errors)
      if (errs.length) {
        toast.warning(`Preview: ${totalToPromote} to promote, ${totalSkip} to skip. Validation issues: ${errs.join("; ")}`)
      } else {
        toast.success(`Preview: ${totalToPromote} students will be promoted, ${totalSkip} already in target (will skip).`)
      }
    } catch {
      // Error toast handled in mutation
    }
  }

  const handleExecute = async () => {
    if (!canPreview) return
    try {
      await executeMutation.mutateAsync(previewPayload)
    } catch {
      // Error toast handled in mutation
    }
  }

  return (
    <div className="space-y-6 px-2 py-4 lg:px-4">
      <DashboardTitle
        heading="Promote Students"
        description="Move students from classes in one academic session to classes in the next. Configure arm mappings below."
      />

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Source = current/ending session; Target = next session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="grid w-full max-w-xs gap-2">
            <Label>Source session</Label>
            <Select value={sourceSessionId} onValueChange={setSourceSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-xs gap-2">
            <Label>Target session</Label>
            <Select value={targetSessionId} onValueChange={setTargetSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arm mappings</CardTitle>
          <CardDescription>Map each source class to the target class students will move to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mappings.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Select
                value={row.sourceClassId}
                onValueChange={(v) => updateMapping(i, "sourceClassId", v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Source class" />
                </SelectTrigger>
                <SelectContent>
                  {flatSourceClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {classLabel(c, c.groupName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">→</span>
              <Select
                value={row.targetClassId}
                onValueChange={(v) => updateMapping(i, "targetClassId", v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Target class" />
                </SelectTrigger>
                <SelectContent>
                  {flatTargetClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {classLabel(c, c.groupName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => removeMapping(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addMapping}>
            <Plus className="mr-2 h-4 w-4" />
            Add mapping
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Preview first, then execute promotion.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={!canPreview || previewMutation.isPending}
          >
            {previewMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Preview
          </Button>
          <Button
            variant="default"
            onClick={handleExecute}
            disabled={!canPreview || executeMutation.isPending}
          >
            {executeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Execute promotion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
