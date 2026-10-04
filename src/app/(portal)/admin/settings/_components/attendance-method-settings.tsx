"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { apiFetch } from "@/lib/api/client"

type Method = "NFC" | "FACE" | "FINGERPRINT"
type Policy = {
  enabledMethods: Method[]
  fingerprintProvider: string
  capabilities: Record<Method, { available: boolean; reason?: string }>
}

const labels: Record<Method, string> = {
  NFC: "NFC card",
  FACE: "Face",
  FINGERPRINT: "Fingerprint",
}

export function AttendanceMethodSettings() {
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [selected, setSelected] = useState<Method[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void apiFetch<{ data: Policy }>("/attendance/mobile/methods")
      .then((response) => {
        setPolicy(response.data)
        setSelected(response.data.enabledMethods)
      })
      .catch(() => toast.error("Could not load attendance methods"))
  }, [])

  const toggle = (method: Method) => {
    setSelected((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method]
    )
  }

  const save = async () => {
    if (selected.length === 0) {
      toast.error("Keep at least one attendance method enabled")
      return
    }
    setSaving(true)
    try {
      const response = await apiFetch<{ data: Policy }>("/attendance/mobile/methods", {
        method: "PATCH",
        data: { enabledMethods: selected },
      })
      setPolicy(response.data)
      setSelected(response.data.enabledMethods)
      toast.success("Attendance methods updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update attendance methods"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Attendance Methods</h2>
        <p className="text-muted-foreground">
          Choose which methods teachers may use at this school.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student attendance</CardTitle>
          <CardDescription>
            Teachers can switch between enabled methods during a class session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {(["NFC", "FACE", "FINGERPRINT"] as const).map((method) => {
            const capability = policy?.capabilities[method]
            return (
              <div
                key={method}
                className="flex items-center justify-between gap-4 border-b pb-4 last:border-0"
              >
                <div>
                  <div className="font-medium">{labels[method]}</div>
                  {capability?.reason && (
                    <p className="text-muted-foreground text-sm">{capability.reason}</p>
                  )}
                </div>
                <Switch
                  aria-label={`Enable ${labels[method]}`}
                  checked={selected.includes(method)}
                  disabled={!policy || saving || !capability?.available}
                  onCheckedChange={() => toggle(method)}
                />
              </div>
            )
          })}
          <p className="text-muted-foreground text-sm">
            Default fingerprint adapter:{" "}
            {policy?.fingerprintProvider === "secugen"
              ? "SecuGen"
              : (policy?.fingerprintProvider ?? "Loading")}
            . A compatible reader and capture SDK are needed before fingerprint can be
            enabled.
          </p>
          <Button onClick={save} disabled={!policy || saving}>
            Save methods
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
