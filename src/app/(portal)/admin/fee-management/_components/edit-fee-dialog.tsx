"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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

const editFeeSchema = z.object({
  component_name: z.string().min(2, "Component name is required"),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
})

type EditFeeFormValues = z.infer<typeof editFeeSchema>

interface EditFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee: FeeComponent | null
  onSuccess?: () => void
}

export function EditFeeDialog({ open, onOpenChange, fee, onSuccess }: EditFeeDialogProps) {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const updateMutation = useUpdateFee(fee?.id || "")

  const form = useForm<EditFeeFormValues>({
    resolver: zodResolver(editFeeSchema),
    defaultValues: {
      component_name: "",
      description: "",
      amount: "",
    },
  })

  // Sessions
  const { data: sessions } = useAcademicSessions()

  // Terms for selected session
  const { data: terms } = useAcademicTermsForSession(selectedSession)

  // Populate form when fee changes
  useEffect(() => {
    if (fee && open) {
      form.reset({
        component_name: fee.component_name || "",
        description: fee.description || "",
        amount: fee.amount || "",
      })

      // Set session for term lookup if it's a TERM fee
      if (fee.period_type === "TERM" && fee.term?.sessionId) {
        setSelectedSession(fee.term.sessionId)
      }
    }
  }, [fee, open, form])

  const onSubmit = async (values: EditFeeFormValues) => {
    if (!fee) return

    await updateMutation.mutateAsync({
      component_name: values.component_name,
      description: values.description || undefined,
      amount: Number(values.amount),
    })

    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Fee</DialogTitle>
          <DialogDescription>
            Update the fee details below. Period type and term/session cannot be changed after
            creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Period Type Info (Read-only) */}
          <div className="rounded-md border bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Period Type</p>
            <p className="mt-1 text-sm text-gray-900">
              {fee?.period_type === "SESSION" ? "Per Session" : "Per Term"}
            </p>
            {fee?.period_type === "TERM" && fee?.term && (
              <p className="mt-1 text-xs text-gray-600">
                Term: {fee.term.name} | Session:{" "}
                {sessions?.data?.find((s) => s.id === fee.term?.sessionId)?.name || "N/A"}
              </p>
            )}
            {fee?.period_type === "SESSION" && fee?.academicSession && (
              <p className="mt-1 text-xs text-gray-600">Session: {fee.academicSession.name}</p>
            )}
          </div>

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
