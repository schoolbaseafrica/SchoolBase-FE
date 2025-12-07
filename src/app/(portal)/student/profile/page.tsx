"use client"

import { ProfilePage } from "@/components/profile/profile-page"
import { ProfileLoading } from "@/components/profile/profile-loading"
import { useGetProfile } from "@/hooks/use-profile"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentProfilePage() {
  const { data: profile, isLoading, error, refetch } = useGetProfile()

  if (isLoading) {
    return <ProfileLoading />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load profile. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <Alert>
          <AlertDescription>No profile data found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <ProfilePage profile={profile} role="student" />
}
