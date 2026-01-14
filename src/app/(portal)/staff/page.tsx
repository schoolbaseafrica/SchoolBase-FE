"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield } from "lucide-react"

export default function StaffPage() {
  const { data: user, isLoading } = useAuthUser()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <DashboardTitle heading="Staff Dashboard" description="Welcome to your staff portal" />
        <div className="mt-6 space-y-4">
          <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <DashboardTitle
        heading="Staff Dashboard"
        description={`Welcome, ${user?.first_name || "Staff Member"}`}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and update your personal information and contact details.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>Your access privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Staff members start with minimal permissions. Contact your administrator to request
              additional access as needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
