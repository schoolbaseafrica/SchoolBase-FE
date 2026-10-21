"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { NewFeatureBadge } from "@/components/ui/new-feature-badge"
import { useAuthUser } from "@/hooks/use-auth-user"
import { AdminsAPI } from "@/lib/admins"
import { apiFetch } from "@/lib/api/client"
import { extractErrorMessage } from "@/lib/error-handler"

type Category = "students" | "attendance" | "fees" | "assessments" | "staff"
type Preference = {
  enabled: boolean
  frequency: "daily" | "weekly"
  categories: Category[]
  next_due_at: string | null
  last_sent_at: string | null
  attempts: number
  mail_configured: boolean
}

const choices: Array<{ id: Category; label: string; detail: string }> = [
  {
    id: "students",
    label: "Students and families",
    detail: "Recorded student and parent changes",
  },
  { id: "attendance", label: "Attendance", detail: "Recorded attendance changes" },
  { id: "fees", label: "Fees and payments", detail: "Recorded fee and payment changes" },
  {
    id: "assessments",
    label: "Exams and results",
    detail: "Submitted CBT attempts and recorded result changes",
  },
  {
    id: "staff",
    label: "Teachers and staff",
    detail: "Recorded teacher and staff changes",
  },
]

export function OwnerEmailDigestSettings() {
  const viewer = useAuthUser()
  const owner = useQuery({
    queryKey: ["first-school-owner"],
    queryFn: AdminsAPI.getFirstOwner,
  })
  const isOwner = Boolean(
    viewer.data?.id && owner.data?.data.owner_user_id === viewer.data.id
  )
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Preference | null>(null)
  const preference = useQuery({
    queryKey: ["owner-email-digest"],
    queryFn: () =>
      apiFetch<{ data: Preference }>("/school/owner-email-digest", undefined, true),
    enabled: isOwner,
  })
  const value = draft ?? preference.data?.data
  const save = useMutation({
    mutationFn: (next: Preference) =>
      apiFetch(
        "/school/owner-email-digest",
        {
          method: "PATCH",
          data: {
            enabled: next.enabled,
            frequency: next.frequency,
            categories: next.categories,
          },
        },
        true
      ),
    onSuccess: async (_response, next) => {
      setDraft(null)
      toast.success(
        next.enabled ? "Owner email summary scheduled" : "Owner email summary turned off"
      )
      await queryClient.invalidateQueries({ queryKey: ["owner-email-digest"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  if (!isOwner) return null

  return (
    <div className="mt-10 max-w-3xl space-y-5 border-t pt-8">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Your school summary</h2>
          <NewFeatureBadge />
        </div>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Get a private email with counts of recorded school activity. Open the linked
          pages for details. Only the school owner can manage or receive this summary.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {preference.isLoading && (
            <p className="text-sm">Loading your summary choices...</p>
          )}
          {preference.isError && (
            <p className="text-sm text-red-700">Unable to load your summary choices.</p>
          )}
          {value && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label htmlFor="owner-summary-enabled" className="font-medium">
                    Email me a school summary
                  </label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Off by default. Sent at 8:00 AM Lagos time.
                  </p>
                </div>
                <Switch
                  id="owner-summary-enabled"
                  checked={value.enabled}
                  onCheckedChange={(enabled) => setDraft({ ...value, enabled })}
                />
              </div>
              {!value.enabled && (
                <p className="text-muted-foreground text-sm">
                  Email summaries are off. Turn this on and save to schedule the first
                  summary for the next 8:00 AM Lagos time.
                </p>
              )}
              <div className="space-y-2">
                <label htmlFor="owner-summary-frequency" className="text-sm font-medium">
                  How often?
                </label>
                <select
                  id="owner-summary-frequency"
                  value={value.frequency}
                  onChange={(event) =>
                    setDraft({
                      ...value,
                      frequency: event.target.value as Preference["frequency"],
                    })
                  }
                  className="border-input bg-background block h-10 w-full max-w-xs rounded-lg border px-3 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly, on Monday</option>
                </select>
              </div>
              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-medium">
                  Include these activities
                </legend>
                {choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-current"
                      checked={value.categories.includes(choice.id)}
                      onChange={(event) =>
                        setDraft({
                          ...value,
                          categories: event.target.checked
                            ? [...value.categories, choice.id]
                            : value.categories.filter((item) => item !== choice.id),
                        })
                      }
                    />
                    <span>
                      <span className="block text-sm font-medium">{choice.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {choice.detail}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
              {value.last_sent_at && (
                <p className="text-muted-foreground text-xs">
                  Last sent:{" "}
                  {new Date(value.last_sent_at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {value.enabled && value.next_due_at && (
                <p className="text-muted-foreground text-sm">
                  Next summary:{" "}
                  {new Date(value.next_due_at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  . Enabling this setting does not send an email immediately.
                </p>
              )}
              {value.enabled && value.mail_configured === false && (
                <p role="alert" className="text-sm text-red-700">
                  Email delivery is not configured. Ask an administrator to check the
                  school application’s mail settings.
                </p>
              )}
              {value.enabled && value.attempts > 0 && (
                <p role="alert" className="text-sm text-amber-800">
                  The last delivery attempt failed. SchoolBase will retry automatically.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Button
        disabled={!value || value.categories.length === 0 || save.isPending || !draft}
        onClick={() => value && save.mutate(value)}
      >
        {save.isPending ? "Saving..." : "Save my summary"}
      </Button>
    </div>
  )
}
