"use client"

import { UserProfileNew } from "@/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Phone, Mail, MapPin, Edit } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface ProfilePageProps {
  profile: UserProfileNew
  role: "student" | "teacher" | "parent" | "admin" | "super admin"
}

export const ProfilePage = ({ profile, role }: ProfilePageProps) => {
  const router = useRouter()

  const handleEditProfile = () => {
    router.push(`/${role}/profile/settings`)
  }

  const handleBackToDashboard = () => {
    router.push(`/${role}`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
          <Button onClick={handleEditProfile} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
                <AvatarImage
                  src={profile.photo_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted text-3xl">
                  {profile.first_name?.[0]}
                  {profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-bold">
                  {profile.first_name} {profile.middle_name} {profile.last_name}
                </h3>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {profile.role?.map((roleItem) => (
                    <Badge key={roleItem} variant="secondary">
                      {roleItem}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 md:pl-8">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Phone</p>
                        <p className="font-medium">{profile.phone || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarDays className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Date of Birth</p>
                        <p className="font-medium">{formatDate(profile.dob)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-muted-foreground text-sm">Address</p>
                        <p className="font-medium">
                          {profile.homeAddress || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-sm">Account Status</p>
                      <Badge
                        variant={profile.is_active ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {profile.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Member Since</p>
                      <p className="font-medium">{formatDate(profile.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Last Updated</p>
                      <p className="font-medium">{formatDate(profile.updated_at)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
