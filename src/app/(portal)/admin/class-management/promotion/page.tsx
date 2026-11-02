"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CLASS_KEYS } from "../_hooks/use-classes"
import { usePromotionPreview, usePromotionExecute } from "../_hooks/use-classes"
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PromotionPreviewDialog } from "./_components/promotion-preview-dialog"
import { ClassesAPI, type PromotionPreviewPayload } from "@/lib/classes"

type MappingRow = { sourceClassId: string; targetClassId: string }

function classLabel(cls: { id: string; arm?: string }, name: string) {
  return `${name}${cls.arm ? ` ${cls.arm}` : ""}`.trim()
}

export default function PromotionPage() {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 })
  const previewMutation = usePromotionPreview()
  const executeMutation = usePromotionExecute()

  const [sourceSessionId, setSourceSessionId] = useState<string>("")
  const [targetSessionId, setTargetSessionId] = useState<string>("")
  const [mappings, setMappings] = useState<MappingRow[]>([])
  const [previewData, setPreviewData] = useState<PromotionPreviewPayload | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewFingerprint, setPreviewFingerprint] = useState("")

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData])
  const sourceQuery = useQuery({
    queryKey: [...CLASS_KEYS.all, "promotion", sourceSessionId],
    queryFn: () => ClassesAPI.getAllForSession(sourceSessionId),
    enabled: !!sourceSessionId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const targetQuery = useQuery({
    queryKey: [...CLASS_KEYS.all, "promotion", targetSessionId],
    queryFn: () => ClassesAPI.getAllForSession(targetSessionId),
    enabled: !!targetSessionId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const statusQuery = useQuery({
    queryKey: [...CLASS_KEYS.all, "promotion-status", sourceSessionId, targetSessionId],
    queryFn: async () =>
      (await ClassesAPI.getPromotionStatus(sourceSessionId, targetSessionId)).data,
    enabled:
      !!sourceSessionId && !!targetSessionId && sourceSessionId !== targetSessionId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const statusByClass = useMemo(
    () => new Map((statusQuery.data ?? []).map((item) => [item.sourceClassId, item])),
    [statusQuery.data]
  )
  const sourceClasses = useMemo(() => sourceQuery.data ?? [], [sourceQuery.data])
  const targetClasses = useMemo(() => targetQuery.data ?? [], [targetQuery.data])

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
    sourceQuery.isSuccess &&
    targetQuery.isSuccess &&
    !sourceQuery.isFetching &&
    !targetQuery.isFetching &&
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
    sourceQuery.isSuccess &&
    targetQuery.isSuccess &&
    !sourceQuery.isFetching &&
    !targetQuery.isFetching &&
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
              {sourceSessionId && sourceQuery.isPending && (
                <p className="text-muted-foreground text-xs">
                  Loading all source classes…
                </p>
              )}
              {sourceSessionId && sourceQuery.isError && (
                <div
                  className="text-destructive flex items-center gap-2 text-xs"
                  role="alert"
                >
                  Could not load the complete source class list.
                  <button
                    type="button"
                    className="underline"
                    onClick={() => sourceQuery.refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {sourceSessionId &&
                sourceQuery.isSuccess &&
                flatSourceClasses.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    No classes found in this session.
                  </p>
                )}
              {sourceSessionId &&
                sourceQuery.isSuccess &&
                flatSourceClasses.length > 0 && (
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
              {targetSessionId && targetQuery.isPending && (
                <p className="text-muted-foreground text-xs">
                  Loading all target classes…
                </p>
              )}
              {targetSessionId && targetQuery.isError && (
                <div
                  className="text-destructive flex items-center gap-2 text-xs"
                  role="alert"
                >
                  Could not load the complete target class list.
                  <button
                    type="button"
                    className="underline"
                    onClick={() => targetQuery.refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {targetSessionId &&
                targetQuery.isSuccess &&
                flatTargetClasses.length === 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div className="flex-1">
                        <p className="mb-1 font-medium text-amber-900">
                          No classes found in target session
                        </p>
                        <p className="mb-2 text-amber-700">
                          You need to create classes in the target session before
                          promoting students.
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
              {targetSessionId &&
                targetQuery.isSuccess &&
                flatTargetClasses.length > 0 && (
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
            {statusQuery.isError && (
              <p className="text-destructive text-xs" role="alert">
                Promotion status could not be loaded.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => statusQuery.refetch()}
                >
                  Retry
                </button>
              </p>
            )}
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
                        {flatSourceClasses.map((c) => {
                          const status = statusByClass.get(c.id)
                          const label =
                            status?.total && status.remaining === 0
                              ? "All in target"
                              : status?.alreadyInTarget
                                ? `${status.remaining} remaining`
                                : null
                          return (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-2">
                                {classLabel(c, c.groupName)}
                                {label && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {label}
                                  </Badge>
                                )}
                              </span>
                            </SelectItem>
                          )
                        })}
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
                disabled={
                  !sourceQuery.isSuccess ||
                  !targetQuery.isSuccess ||
                  sourceQuery.isFetching ||
                  targetQuery.isFetching
                }
              >
                Match classes automatically
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addMapping}
                disabled={
                  !sourceQuery.isSuccess ||
                  !targetQuery.isSuccess ||
                  sourceQuery.isFetching ||
                  targetQuery.isFetching
                }
              >
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
