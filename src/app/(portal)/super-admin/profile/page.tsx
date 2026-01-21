"use client"

import { ProfilePage } from "@/components/profile/profile-page"
import { ProfileLoading } from "@/components/profile/profile-loading"
import { useGetProfile } from "@/hooks/use-profile"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuperAdminProfilePage() {
  const { data: profile, isLoading, error, refetch } = useGetProfile()

  if (isLoading) {
    return <ProfileLoading />
  }

  if (error) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Profile</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
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
      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Profile</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            View and manage your profile information
          </p>
        </div>

        <Alert>
          <AlertDescription>No profile data found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <ProfilePage profile={profile} role="super admin" />
}
