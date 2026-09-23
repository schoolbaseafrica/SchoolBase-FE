"use client"

import { useState, useMemo } from "react"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PromotionPreviewDialog } from "./_components/promotion-preview-dialog"
import type { PromotionPreviewPayload } from "@/lib/classes"

type MappingRow = { sourceClassId: string; targetClassId: string }

function classLabel(cls: { id: string; arm?: string }, name: string) {
  return `${name}${cls.arm ? ` ${cls.arm}` : ""}`.trim()
}

export default function PromotionPage() {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  // Use includeAllSessions=true to see classes from all sessions (needed for promotion)
  const { data: classesData } = useGetClassesInfo({
    includeArchived: false,
    includeAllSessions: true,
  })
  const previewMutation = usePromotionPreview()
  const executeMutation = usePromotionExecute()

  const [sourceSessionId, setSourceSessionId] = useState<string>("")
  const [targetSessionId, setTargetSessionId] = useState<string>("")
  const [mappings, setMappings] = useState<MappingRow[]>([])
  const [previewData, setPreviewData] = useState<PromotionPreviewPayload | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewFingerprint, setPreviewFingerprint] = useState("")

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData])
  const allClasses = useMemo(() => classesData?.items ?? [], [classesData])

  const sourceClasses = useMemo(() => {
    if (!sourceSessionId) return []
    return allClasses.filter((g) => g.academicSession?.id === sourceSessionId)
  }, [allClasses, sourceSessionId])

  const targetClasses = useMemo(() => {
    if (!targetSessionId) return []
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
    if (!sourceSessionId || !targetSessionId) {
      toast.error("Please select both source and target sessions first.")
      return
    }
    if (sourceSessionId === targetSessionId) {
      toast.error("Source and target sessions must be different.")
      return
    }
    if (flatSourceClasses.length === 0) {
      toast.error("No classes found in the source session. Please create classes first.")
      return
    }
    if (flatTargetClasses.length === 0) {
      toast.error(
        "No classes found in the target session. Please create classes in the target session first."
      )
      return
    }
    const unusedSources = flatSourceClasses.filter(
      (source) => !mappings.some((mapping) => mapping.sourceClassId === source.id)
    )
    const firstSource = unusedSources[0]
    if (!firstSource) {
      toast.info("Every source class already has a mapping.")
      return
    }
    const firstTarget =
      flatTargetClasses.find(
        (target) =>
          target.groupName === firstSource.groupName && target.arm === firstSource.arm
      ) ?? flatTargetClasses[0]
    setMappings((prev) => [
      ...prev,
      { sourceClassId: firstSource.id, targetClassId: firstTarget.id },
    ])
    setPreviewData(null)
    setPreviewFingerprint("")
  }

  const generateMappings = () => {
    const generated = flatSourceClasses.flatMap((source) => {
      const target = flatTargetClasses.find(
        (candidate) =>
          candidate.groupName === source.groupName && candidate.arm === source.arm
      )
      return target ? [{ sourceClassId: source.id, targetClassId: target.id }] : []
    })
    setMappings(generated)
    setPreviewData(null)
    setPreviewFingerprint("")
    if (generated.length === 0) {
      toast.warning("No matching class names and arms were found in the target session.")
    } else {
      toast.success(`${generated.length} matching class mappings generated.`)
    }
  }

  const removeMapping = (i: number) => {
    setMappings((prev) => prev.filter((_, idx) => idx !== i))
    setPreviewData(null)
    setPreviewFingerprint("")
  }

  const updateMapping = (
    i: number,
    field: "sourceClassId" | "targetClassId",
    value: string
  ) => {
    setMappings((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    )
    setPreviewData(null)
    setPreviewFingerprint("")
  }

  const canPreview =
    sourceSessionId &&
    targetSessionId &&
    sourceSessionId !== targetSessionId &&
    mappings.length > 0
  const previewPayload = useMemo(
    () => ({
      sourceSessionId,
      targetSessionId,
      armMappings: mappings,
    }),
    [sourceSessionId, targetSessionId, mappings]
  )
  const currentFingerprint = JSON.stringify(previewPayload)
  const canExecute =
    !!previewData &&
    previewFingerprint === currentFingerprint &&
    previewData.errors.length === 0 &&
    previewData.mappings.some((mapping) => mapping.toPromote > 0)

  const handlePreview = async () => {
    if (!canPreview) return
    try {
      const res = await previewMutation.mutateAsync(previewPayload)
      setPreviewData(res)
      setPreviewFingerprint(currentFingerprint)
      setPreviewDialogOpen(true)
    } catch {}
  }

  const handleExecute = async () => {
    if (!canExecute) return
    try {
      await executeMutation.mutateAsync(previewPayload)
      setPreviewData(null)
      setPreviewFingerprint("")
      setPreviewDialogOpen(false)
    } catch {}
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-2 py-4 lg:px-4">
      <DashboardTitle
        heading="Promote Students"
        description="Move students from classes in one academic session to classes in the next. Configure arm mappings below."
      />
      <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        {/* Sessions Card */}
        <Card className="order-1 md:order-1">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Select source and target academic sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Source session</Label>
              <Select
                value={sourceSessionId}
                onValueChange={(value) => {
                  setSourceSessionId(value)
                  if (value === targetSessionId) {
                    setTargetSessionId("")
                    toast.warning(
                      "Source and target sessions must be different. Target session cleared."
                    )
                  }
                  setMappings([]) // Clear mappings when source changes
                  setPreviewData(null)
                  setPreviewFingerprint("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      disabled={s.id === targetSessionId}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceSessionId && flatSourceClasses.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  No classes found in this session.
                </p>
              )}
              {sourceSessionId && flatSourceClasses.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {flatSourceClasses.length} class
                  {flatSourceClasses.length !== 1 ? "es" : ""} available
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Target session</Label>
              <Select
                value={targetSessionId}
                onValueChange={(value) => {
                  setTargetSessionId(value)
                  if (value === sourceSessionId) {
                    setSourceSessionId("")
                    toast.warning(
                      "Source and target sessions must be different. Source session cleared."
                    )
                  }
                  setMappings([]) // Clear mappings when target changes
                  setPreviewData(null)
                  setPreviewFingerprint("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      disabled={s.id === sourceSessionId}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetSessionId && flatTargetClasses.length === 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div className="flex-1">
                      <p className="mb-1 font-medium text-amber-900">
                        No classes found in target session
                      </p>
                      <p className="mb-2 text-amber-700">
                        You need to create classes in the target session before promoting
                        students.
                      </p>
                      <Link
                        href="/admin/class-management/class/new"
                        className="font-medium text-amber-700 underline hover:text-amber-900"
                      >
                        Create classes →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {targetSessionId && flatTargetClasses.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {flatTargetClasses.length} class
                  {flatTargetClasses.length !== 1 ? "es" : ""} available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Arm Mappings Card - Full Width */}
        <Card className="order-2 md:order-3 md:col-span-2">
          <CardHeader>
            <CardTitle>Arm Mappings</CardTitle>
            <CardDescription>
              Map each source class to the target class students will move to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mappings.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No mappings added yet. Use Add mapping to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {mappings.map((row, i) => (
                  <div
                    key={i}
                    className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3"
                  >
                    <Select
                      value={row.sourceClassId}
                      onValueChange={(v) => updateMapping(i, "sourceClassId", v)}
                    >
                      <SelectTrigger className="min-w-[200px] flex-1">
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
                    <span className="text-muted-foreground text-lg">→</span>
                    <Select
                      value={row.targetClassId}
                      onValueChange={(v) => updateMapping(i, "targetClassId", v)}
                    >
                      <SelectTrigger className="min-w-[200px] flex-1">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMapping(i)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={generateMappings}
                disabled={!sourceSessionId || !targetSessionId}
              >
                Match classes automatically
              </Button>
              <Button type="button" variant="outline" onClick={addMapping}>
                <Plus className="mr-2 h-4 w-4" />
                Add mapping
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="order-3 md:order-2">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Preview first, then execute promotion</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={handlePreview}
              disabled={!canPreview || previewMutation.isPending}
              className="w-full"
            >
              {previewMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Preview Promotion
            </Button>
            <Button
              variant="default"
              onClick={handleExecute}
              disabled={!canExecute || executeMutation.isPending}
              className="w-full"
            >
              {executeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Execute Promotion
            </Button>
            {!canExecute && previewData && (
              <p className="text-muted-foreground text-xs">
                Resolve preview errors or add a mapping with students before executing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <PromotionPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        previewData={previewData}
        sourceSessionName={sessions.find((s) => s.id === sourceSessionId)?.name}
        targetSessionName={sessions.find((s) => s.id === targetSessionId)?.name}
      />
    </div>
  )
}
