"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api/client"
import { extractErrorMessage } from "@/lib/error-handler"

type AlertSettings = {
  email_alert_results: boolean
  email_alert_fees: boolean
  email_alert_attendance: boolean
}

const emptySettings: AlertSettings = {
  email_alert_results: false,
  email_alert_fees: false,
  email_alert_attendance: false,
}

const alertRows: Array<{ key: keyof AlertSettings; title: string; description: string }> =
  [
    {
      key: "email_alert_results",
      title: "Published results",
      description: "Email a linked parent when a student's result is published.",
    },
    {
      key: "email_alert_fees",
      title: "Fee changes",
      description:
        "Email linked parents when a fee is created or changed for their child.",
    },
    {
      key: "email_alert_attendance",
      title: "Absence and lateness",
      description: "Email linked parents when daily attendance is marked absent or late.",
    },
  ]

export function NotificationSettings() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<AlertSettings | null>(null)
  const school = useQuery({
    queryKey: ["school-email-alert-settings"],
    queryFn: () => apiFetch<{ data: AlertSettings }>("/school", undefined, true),
  })
  const settings =
    draft ??
    (school.data?.data && {
      email_alert_results: school.data.data.email_alert_results ?? false,
      email_alert_fees: school.data.data.email_alert_fees ?? false,
      email_alert_attendance: school.data.data.email_alert_attendance ?? false,
    })

  const save = useMutation({
    mutationFn: (values: AlertSettings) => {
      const data = new FormData()
      for (const row of alertRows) data.append(row.key, String(values[row.key]))
      return apiFetch<{ data: AlertSettings }>("/school", { method: "PATCH", data }, true)
    },
    onSuccess: async () => {
      toast.success("Email alert settings saved")
      setDraft(null)
      await queryClient.invalidateQueries({ queryKey: ["school-email-alert-settings"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Email alerts</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Choose which school activity emails linked parents receive. Invitations,
          password setup, and parent access links are unaffected.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-5 pt-6">
          {school.isLoading && <p className="text-sm">Loading alert settings...</p>}
          {school.isError && (
            <p className="text-sm text-red-700">Unable to load alert settings.</p>
          )}
          {settings &&
            alertRows.map((row) => (
              <div
                key={row.key}
                className="flex items-start justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div>
                  <label htmlFor={row.key} className="font-medium">
                    {row.title}
                  </label>
                  <p className="text-muted-foreground mt-1 text-sm">{row.description}</p>
                </div>
                <Switch
                  id={row.key}
                  checked={settings[row.key]}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...(current ?? settings ?? emptySettings),
                      [row.key]: checked,
                    }))
                  }
                />
              </div>
            ))}
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">
        Configure the school SMTP host and sender address in Coolify before enabling
        alerts. Emails are queued and retried if delivery fails.
      </p>
      <Button
        disabled={!settings || save.isPending}
        onClick={() => settings && save.mutate(settings)}
      >
        {save.isPending ? "Saving..." : "Save email alerts"}
      </Button>
    </div>
  )
}
