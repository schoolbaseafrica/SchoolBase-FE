"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react"
import type { PromotionMapping } from "@/lib/classes"

interface PromotionPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewData: {
    sourceSessionId: string
    targetSessionId: string
    mappings: PromotionMapping[]
    errors: string[]
  } | null
  sourceSessionName?: string
  targetSessionName?: string
}

export function PromotionPreviewDialog({
  open,
  onOpenChange,
  previewData,
  sourceSessionName,
  targetSessionName,
}: PromotionPreviewDialogProps) {
  if (!previewData) return null

  const totalToPromote = previewData.mappings.reduce((sum, m) => sum + m.toPromote, 0)
  const totalToSkip = previewData.mappings.reduce((sum, m) => sum + m.alreadyInTarget, 0)
  const hasErrors = previewData.errors.length > 0 || previewData.mappings.some((m) => m.errors.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh]"
        aria-describedby="promotion-preview-description"
      >
        <DialogHeader>
          <DialogTitle>Promotion Preview</DialogTitle>
          <DialogDescription id="promotion-preview-description">
            Review the promotion details before executing. This shows which students will be moved and which will be skipped.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm font-medium text-muted-foreground">Total to Promote</div>
                <div className="text-2xl font-bold text-primary mt-1">{totalToPromote}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm font-medium text-muted-foreground">Already in Target</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">{totalToSkip}</div>
                <div className="text-xs text-muted-foreground mt-1">Will be skipped</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm font-medium text-muted-foreground">Mappings</div>
                <div className="text-2xl font-bold mt-1">{previewData.mappings.length}</div>
              </div>
            </div>

            {/* Overall Errors */}
            {previewData.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Overall Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {previewData.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Session Info */}
            {(sourceSessionName || targetSessionName) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Source:</span>
                <span>{sourceSessionName || "Unknown"}</span>
                <ArrowRight className="h-4 w-4 mx-2" />
                <span className="font-medium">Target:</span>
                <span>{targetSessionName || "Unknown"}</span>
              </div>
            )}

            <Separator />

            {/* Mapping Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mapping Details</h3>
              {previewData.mappings.map((mapping, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  {/* Class Mapping Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-muted-foreground">Source Class</div>
                        <div className="font-semibold">{mapping.sourceClassName}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-muted-foreground">Target Class</div>
                        <div className="font-semibold">{mapping.targetClassName}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">To Promote</div>
                        <div className="text-lg font-bold text-green-600">{mapping.toPromote}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-amber-600" />
                      <div>
                        <div className="text-sm font-medium">Already in Target</div>
                        <div className="text-lg font-bold text-amber-600">{mapping.alreadyInTarget}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mapping-specific Errors */}
                  {mapping.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Mapping Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {mapping.errors.map((error, errorIdx) => (
                            <li key={errorIdx} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Student IDs (if any) - Collapsible or shown in a compact way */}
                  {(mapping.toPromoteStudentIds.length > 0 || mapping.alreadyInTargetStudentIds.length > 0) && (
                    <div className="space-y-2 text-xs">
                      {mapping.toPromoteStudentIds.length > 0 && (
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">
                            Students to Promote ({mapping.toPromoteStudentIds.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {mapping.toPromoteStudentIds.slice(0, 10).map((id) => (
                              <Badge key={id} variant="outline" className="text-xs">
                                {id.substring(0, 8)}...
                              </Badge>
                            ))}
                            {mapping.toPromoteStudentIds.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{mapping.toPromoteStudentIds.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {mapping.alreadyInTargetStudentIds.length > 0 && (
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">
                            Already in Target ({mapping.alreadyInTargetStudentIds.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {mapping.alreadyInTargetStudentIds.slice(0, 10).map((id) => (
                              <Badge key={id} variant="outline" className="text-xs">
                                {id.substring(0, 8)}...
                              </Badge>
                            ))}
                            {mapping.alreadyInTargetStudentIds.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{mapping.alreadyInTargetStudentIds.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Warning if no students to promote */}
            {totalToPromote === 0 && totalToSkip === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Students Found</AlertTitle>
                <AlertDescription>
                  No students were found in the source classes to promote. Please check that the source classes have students assigned.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
