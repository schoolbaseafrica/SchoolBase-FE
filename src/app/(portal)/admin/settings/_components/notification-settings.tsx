"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export const NotificationSettings = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    inviteNotification: true,
    attendanceNotification: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Notification settings updated")
    } catch {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
        <p className="text-muted-foreground">
          Choose how you want to be notified about account activity.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Email Notifications</CardTitle>
          <CardDescription>Receive notifications via email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="invite-notification" className="text-base font-medium">
                Invite Notification
              </Label>
              <p className="text-muted-foreground text-sm">
                Get notified when invites are accepted
              </p>
            </div>
            <Switch
              id="invite-notification"
              checked={settings.inviteNotification}
              onCheckedChange={() => handleToggle("inviteNotification")}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="attendance-notification" className="text-base font-medium">
                Attendance Notification
              </Label>
              <p className="text-muted-foreground text-sm">
                Get notified when staff/student marks attendance
              </p>
            </div>
            <Switch
              id="attendance-notification"
              checked={settings.attendanceNotification}
              onCheckedChange={() => handleToggle("attendanceNotification")}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-accent hover:bg-accent/90 w-full text-white lg:w-fit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
