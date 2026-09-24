"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Plus, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CbtAPI,
  CbtBlueprintPreview,
  CbtBlueprintRule,
  CbtExamSection,
  CbtQuestionType,
} from "@/lib/cbt"

const TYPES: Array<{ value: CbtQuestionType; label: string }> = [
  { value: "mcq", label: "Multiple choice" },
  { value: "multiple_response", label: "Multiple response" },
  { value: "true_false", label: "True or false" },
  { value: "short_answer", label: "Short answer" },
  { value: "essay", label: "Essay" },
]

const EMPTY_RULE: CbtBlueprintRule = { count: 5 }

export function BlueprintDialog({
  examId,
  sections,
  onApplied,
}: {
  examId: string
  sections: CbtExamSection[]
  onApplied: () => void
}) {
  const [open, setOpen] = useState(false)
  const [rules, setRules] = useState<CbtBlueprintRule[]>([{ ...EMPTY_RULE }])
  const [preview, setPreview] = useState<CbtBlueprintPreview | null>(null)

  const generate = useMutation({
    mutationFn: () => CbtAPI.previewBlueprint(examId, rules),
    onSuccess: setPreview,
    onError: (error: Error) =>
      toast.error(error.message || "Could not generate a paper preview"),
  })
  const apply = useMutation({
    mutationFn: () =>
      CbtAPI.applyBlueprint(
        examId,
        preview!.rules.flatMap((rule) =>
          rule.questions.map((question) => ({
            questionId: question.id,
            sectionId: rule.sectionId ?? undefined,
          }))
        )
      ),
    onSuccess: () => {
      toast.success("Generated questions added to the draft")
      setOpen(false)
      setPreview(null)
      onApplied()
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not add the generated questions"),
  })

  const updateRule = (index: number, changes: Partial<CbtBlueprintRule>) => {
    setRules((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...changes } : rule
      )
    )
    setPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" /> Generate paper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate from a blueprint</DialogTitle>
          <DialogDescription>
            Define the mix of questions, preview the exact paper, then copy independent
            questions into this draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="grid gap-3 rounded-xl border p-4 md:grid-cols-5">
              <div className="space-y-1">
                <Label>Topic</Label>
                <Input
                  value={rule.topic ?? ""}
                  placeholder="Any topic"
                  onChange={(event) =>
                    updateRule(index, { topic: event.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Question type</Label>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={rule.type ?? ""}
                  onChange={(event) =>
                    updateRule(index, {
                      type: (event.target.value || undefined) as
                        | CbtQuestionType
                        | undefined,
                    })
                  }
                >
                  <option value="">Any type</option>
                  {TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Difficulty</Label>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={rule.difficulty ?? ""}
                  onChange={(event) =>
                    updateRule(index, {
                      difficulty: (event.target.value || undefined) as
                        | CbtBlueprintRule["difficulty"]
                        | undefined,
                    })
                  }
                >
                  <option value="">Any difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Section</Label>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={rule.sectionId ?? ""}
                  onChange={(event) =>
                    updateRule(index, { sectionId: event.target.value || undefined })
                  }
                >
                  <option value="">No section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label>Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={rule.count}
                    onChange={(event) =>
                      updateRule(index, {
                        count: Math.max(1, Number(event.target.value)),
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove rule"
                  disabled={rules.length === 1}
                  onClick={() => {
                    setRules((current) => current.filter((_, i) => i !== index))
                    setPreview(null)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRules((current) => [...current, { ...EMPTY_RULE }])
                setPreview(null)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add rule
            </Button>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              {preview ? "Regenerate preview" : "Preview paper"}
            </Button>
          </div>

          {preview && (
            <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Generated paper preview</p>
                  <p className="text-sm text-slate-600">
                    {preview.selected} of {preview.requested} requested questions selected
                  </p>
                </div>
                <Badge variant={preview.valid ? "default" : "destructive"}>
                  {preview.valid ? "Ready to add" : "Question bank shortage"}
                </Badge>
              </div>
              {preview.rules.map((rule) => (
                <div key={rule.ruleIndex} className="rounded-lg bg-white p-3">
                  <p className="text-sm font-medium">
                    Rule {rule.ruleIndex + 1}: {rule.questions.length} selected
                    {rule.shortage > 0 ? ` · ${rule.shortage} missing` : ""}
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                    {rule.questions.map((question) => (
                      <li key={question.id}>{question.body}</li>
                    ))}
                  </ol>
                </div>
              ))}
              <Button
                className="w-full"
                disabled={!preview.valid || apply.isPending}
                onClick={() => apply.mutate()}
              >
                Add generated questions to draft
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
