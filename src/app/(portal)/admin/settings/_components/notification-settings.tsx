import { Bell, Info } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const NotificationSettings = () => (
  <div className="max-w-3xl space-y-6">
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        School activity alerts are under review.
      </p>
    </div>
    <Card>
      <CardContent className="flex items-start gap-4">
        <span className="bg-accent/10 text-accent rounded-xl p-3">
          <Bell className="size-5" />
        </span>
        <div className="space-y-2">
          <h3 className="font-semibold">Email alerts are not configured yet</h3>
          <p className="text-muted-foreground text-sm leading-6">
            Invitations and attendance records still work, but the previous switches on
            this page did not save a preference or send email. We have removed those
            controls until email event delivery is connected.
          </p>
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <Info className="size-4" /> No notification settings were changed.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
)
