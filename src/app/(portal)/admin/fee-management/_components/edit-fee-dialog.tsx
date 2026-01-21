"use client"

import React, { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useUpdateFee } from "../_hooks/use-fees"
import type { FeeComponent } from "@/lib/fees-management"
import { useAcademicSessions } from "../../class-management/session/_hooks/use-session"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"

const editFeeSchema = z
  .object({
    component_name: z.string().min(2, "Component name is required"),
    description: z.string().optional(),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
    period_type: z.enum(["TERM", "SESSION"]).optional(),
    session_id: z.string().uuid().optional(),
    term_id: z.string().uuid().optional(),
    class_ids: z.array(z.string().uuid()).min(0).optional(),
  })
  .refine(
    (data) => {
      // Only validate period/term/session if period_type is provided (i.e., fee is not assigned)
      if (!data.period_type) return true
      if (data.period_type === "TERM") {
        return !!data.term_id
      }
      return !!data.session_id
    },
    {
      message: "Please select a term or session",
    }
  )

type EditFeeFormValues = z.infer<typeof editFeeSchema>

interface EditFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee: FeeComponent | null
  onSuccess?: () => void
}

export function EditFeeDialog({ open, onOpenChange, fee, onSuccess }: EditFeeDialogProps) {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const updateMutation = useUpdateFee(fee?.id || "")

  const form = useForm<EditFeeFormValues>({
    resolver: zodResolver(editFeeSchema),
    defaultValues: {
      component_name: "",
      description: "",
      amount: "",
      period_type: "TERM",
      session_id: undefined,
      term_id: undefined,
      class_ids: [],
    },
  })

  // Sessions
  const { data: sessions } = useAcademicSessions()

  // Terms for selected session
  const { data: terms } = useAcademicTermsForSession(selectedSession)

  // Classes
  const { data: classes, isLoading: loadingClasses } = useGetClassesInfo()

  const periodType = useWatch({ control: form.control, name: "period_type" })

  // Get all class IDs for "Select All" functionality
  const allClassIds = React.useMemo(() => {
    if (!classes?.items) return []
    return classes.items
      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
      .flatMap((clsItem) =>
        clsItem.classes.filter((cls) => cls?.id).map((cls) => cls.id)
      )
  }, [classes])

  const isAllSelected = allClassIds.length > 0 && selectedClassIds.length === allClassIds.length
  const isPartiallySelected = selectedClassIds.length > 0 && selectedClassIds.length < allClassIds.length

  // Get class IDs for each stream
  const streamClassIdsMap = React.useMemo(() => {
    const map = new Map<string, string[]>()
    if (!classes?.items) return map
    
    classes.items
      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
      .forEach((clsItem) => {
        const streamClassIds = clsItem.classes
          .filter((cls) => cls?.id)
          .map((cls) => cls.id)
        map.set(clsItem.name, streamClassIds)
      })
    return map
  }, [classes])

  // Check if a stream is fully selected
  const isStreamSelected = (streamName: string) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (streamClassIds.length === 0) return false
    return streamClassIds.every((id) => selectedClassIds.includes(id))
  }

  // Check if a stream is partially selected
  const isStreamPartiallySelected = (streamName: string) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (streamClassIds.length === 0) return false
    const selectedCount = streamClassIds.filter((id) => selectedClassIds.includes(id)).length
    return selectedCount > 0 && selectedCount < streamClassIds.length
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClassIds(allClassIds)
    } else {
      setSelectedClassIds([])
    }
  }

  const handleSelectStream = (streamName: string, checked: boolean) => {
    const streamClassIds = streamClassIdsMap.get(streamName) || []
    if (checked) {
      setSelectedClassIds((prev) => {
        const newIds = [...prev]
        streamClassIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id)
          }
        })
        return newIds
      })
    } else {
      setSelectedClassIds((prev) => prev.filter((id) => !streamClassIds.includes(id)))
    }
  }

  const toggleClass = (id: string) => {
    const updated = selectedClassIds.includes(id)
      ? selectedClassIds.filter((c) => c !== id)
      : [...selectedClassIds, id]
    setSelectedClassIds(updated)
  }

  // Sync selectedClassIds with RHF
  useEffect(() => {
    form.setValue("class_ids", selectedClassIds)
  }, [selectedClassIds, form])

  // Reset term/session when period type changes
  useEffect(() => {
    if (periodType === "TERM") {
      form.setValue("session_id", undefined)
      // Don't reset selectedSession if fee was already TERM type
      if (fee?.period_type !== "TERM" && fee?.term?.sessionId) {
        setSelectedSession(fee.term.sessionId)
      }
    } else {
      form.setValue("term_id", undefined)
      // Only clear selectedSession if we're switching away from TERM
      if (periodType === "SESSION" && fee?.period_type === "TERM") {
        setSelectedSession("")
      }
    }
  }, [periodType, form])

  // Reset term when session changes (for TERM period type)
  useEffect(() => {
    if (selectedSession && periodType === "TERM") {
      form.setValue("term_id", undefined)
    }
  }, [selectedSession, periodType, form])

  // Populate form when fee changes
  useEffect(() => {
    if (fee && open) {
      const currentClassIds = fee.classes?.map((c) => c.id) || []
      setSelectedClassIds(currentClassIds)

      form.reset({
        component_name: fee.component_name || "",
        description: fee.description || "",
        amount: fee.amount || "",
        period_type: (fee.period_type as "TERM" | "SESSION") || "TERM",
        term_id: fee.term_id || undefined,
        session_id: fee.session_id || undefined,
        class_ids: currentClassIds,
      })

      // Set session for term lookup if it's a TERM fee
      if (fee.period_type === "TERM" && fee.term?.sessionId) {
        setSelectedSession(fee.term.sessionId)
      } else if (fee.period_type === "SESSION" && fee.session_id) {
        // For SESSION type, we can set the session_id directly
      }
    }
  }, [fee, open, form])

  const onSubmit = async (values: EditFeeFormValues) => {
    if (!fee) return

    const isAssigned = fee.is_assigned ?? false

    // If fee is assigned, only send editable fields
    const updatePayload = isAssigned
      ? {
          component_name: values.component_name,
          description: values.description || undefined,
          amount: Number(values.amount),
        }
      : {
          component_name: values.component_name,
          description: values.description || undefined,
          amount: Number(values.amount),
          period_type: values.period_type,
          term_id: values.period_type === "TERM" ? values.term_id : undefined,
          session_id: values.period_type === "SESSION" ? values.session_id : undefined,
          class_ids: values.class_ids || [],
        }

    await updateMutation.mutateAsync(updatePayload)

    onSuccess?.()
    onOpenChange(false)
  }

  const isAssigned = fee?.is_assigned ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="edit-fee-description"
      >
        <DialogHeader>
          <DialogTitle>Edit Fee</DialogTitle>
          <DialogDescription id="edit-fee-description">
            {isAssigned ? (
              <>
                This fee has already been assigned. You can only edit the name, description, and amount. 
                To change period type or class assignments, please use the assignment management feature or create a new fee.
              </>
            ) : (
              <>
                Update the fee details below. You can change the period type and class assignments.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Component Name */}
          <div className="space-y-1">
            <Label htmlFor="component_name">Fee Name</Label>
            <Input
              id="component_name"
              placeholder="Tuition Fee"
              {...form.register("component_name")}
            />
            {form.formState.errors.component_name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.component_name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Optional" {...form.register("description")} />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Amount"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Period Type - Only shown if fee is not assigned */}
          {!isAssigned && (
            <>
              <div className="space-y-1">
                <Label>Fee Period Type</Label>
                <Select
                  value={periodType || "TERM"}
                  onValueChange={(value: "TERM" | "SESSION") => {
                    form.setValue("period_type", value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select period type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TERM">Per Term</SelectItem>
                    <SelectItem value="SESSION">Per Session</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {periodType === "TERM"
                    ? "Fee applies to a specific term"
                    : "Fee applies to the entire academic session"}
                </p>
                {form.formState.errors.period_type && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.period_type.message}
                  </p>
                )}
              </div>

              {/* Session - For TERM period type */}
              {periodType === "TERM" && (
            <div className="space-y-1">
              <Label>Academic Session</Label>
              {sessions?.data?.length ? (
                <Select
                  value={selectedSession}
                  onValueChange={(value) => {
                    setSelectedSession(value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.data.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No sessions available</p>
              )}
              </div>
              )}

              {/* Term - Only shown when period_type is TERM */}
              {periodType === "TERM" && (
            <div className="space-y-1">
              <Label>Term</Label>
              {!selectedSession ? (
                <p className="text-sm text-gray-500">Please select a session first</p>
              ) : terms && terms.length > 0 ? (
                <Select
                  value={form.watch("term_id") || ""}
                  onValueChange={(value) => form.setValue("term_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No terms available for this session</p>
              )}
              {form.formState.errors.term_id && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.term_id.message}
                </p>
              )}
              </div>
              )}

              {/* Session - Only shown when period_type is SESSION */}
              {periodType === "SESSION" && (
            <div className="space-y-1">
              <Label>Academic Session</Label>
              {sessions?.data?.length ? (
                <Select
                  value={form.watch("session_id") || ""}
                  onValueChange={(value) => form.setValue("session_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.data.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No sessions available</p>
              )}
              {form.formState.errors.session_id && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.session_id.message}
                </p>
              )}
              </div>
              )}
            </>
          )}

          {/* Classes - Only shown if fee is not assigned */}
          {!isAssigned && (
            <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Fee Assignment</Label>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Choose how this fee should be applied. Leave unselected to create an unassigned fee that can be assigned later to specific classes or students.
            </p>
            
            {loadingClasses ? (
              <p className="text-sm text-gray-500">Loading classes...</p>
            ) : classes?.items?.length ? (
              <div className="space-y-3">
                {/* Select All Checkbox */}
                <div className="flex items-center space-x-2 rounded-md border p-3 bg-gray-50/50">
                  <Checkbox
                    id="select-all-classes-edit"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isPartiallySelected ? "data-[state=checked]:bg-amber-500" : ""}
                  />
                  <label
                    htmlFor="select-all-classes-edit"
                    className="cursor-pointer text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Apply to All Classes (School-wide)
                  </label>
                  {isAllSelected && (
                    <span className="text-xs text-green-600 ml-2">✓ Selected</span>
                  )}
                </div>

                {/* Stream Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select entire streams (all arms):</Label>
                  <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-3">
                    {classes.items
                      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
                      .map((clsItem) => {
                        const streamSelected = isStreamSelected(clsItem.name)
                        const streamPartiallySelected = isStreamPartiallySelected(clsItem.name)
                        const armCount = clsItem.classes.filter((cls) => cls?.id).length
                        
                        return (
                          <div key={`stream-${clsItem.name}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`stream-edit-${clsItem.name}`}
                              checked={streamSelected}
                              onCheckedChange={(checked) => handleSelectStream(clsItem.name, checked as boolean)}
                              className={streamPartiallySelected ? "data-[state=checked]:bg-amber-500" : ""}
                            />
                            <label
                              htmlFor={`stream-edit-${clsItem.name}`}
                              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {clsItem.name || "Unknown"}
                              <span className="text-xs text-gray-500 ml-1">
                                ({armCount} arm{armCount !== 1 ? "s" : ""})
                              </span>
                            </label>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Individual Arm Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Or select specific arms:</Label>
                  <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-2">
                    {classes.items
                      .filter((clsItem) => clsItem?.name && clsItem?.classes?.length)
                      .map((clsItem) => (
                        <div key={`group-edit-${clsItem.name}`} className="space-y-1">
                          <div className="text-xs font-semibold text-gray-600 pb-1 border-b">
                            {clsItem.name}
                          </div>
                          {clsItem.classes
                            .filter((cls) => cls?.id)
                            .map((cls) => (
                              <div key={cls.id} className="flex items-center space-x-2 pl-2">
                                <Checkbox
                                  id={`edit-${cls.id}`}
                                  checked={selectedClassIds.includes(cls.id)}
                                  onCheckedChange={() => toggleClass(cls.id)}
                                />
                                <label
                                  htmlFor={`edit-${cls.id}`}
                                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {cls.arm || "Default"}
                                </label>
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Status Messages */}
                {selectedClassIds.length === 0 && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-2">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Unassigned Fee:</span> This fee will be updated without any class assignments. You can assign it to specific classes or students later.
                    </p>
                  </div>
                )}
                {isAllSelected && (
                  <div className="rounded-md border border-green-200 bg-green-50 p-2">
                    <p className="text-xs text-green-700">
                      <span className="font-medium">School-wide Fee:</span> This fee will apply to all classes in the school.
                    </p>
                  </div>
                )}
                {isPartiallySelected && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                    <p className="text-xs text-amber-700">
                      <span className="font-medium">Partial Selection:</span> This fee will apply to {selectedClassIds.length} selected class{selectedClassIds.length > 1 ? "es" : ""} only.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  No classes available. This fee will be updated as unassigned and can be assigned later.
                </p>
              </div>
            )}
            {form.formState.errors.class_ids && (
              <p className="text-xs text-red-500">{form.formState.errors.class_ids.message}</p>
            )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Fee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
