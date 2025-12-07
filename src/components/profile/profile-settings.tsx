"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { UpdateProfileRequestNew } from "@/types/profile"
import { useUpdateProfile, useGetProfile } from "@/hooks/use-profile"

interface ProfileSettingsProps {
  role: "student" | "teacher" | "parent" | "admin" | "super admin"
}

interface FormData {
  first_name: string
  last_name: string
  middle_name: string
  phone: string
  homeAddress: string
}

export const ProfileSettings = ({ role }: ProfileSettingsProps) => {
  const router = useRouter()
  const { data: profile, isLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
    homeAddress: "",
  })

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        middle_name: profile.middle_name || "",
        phone: profile.phone || "",
        homeAddress: profile.homeAddress || "",
      })
    }
  }, [profile])

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove whitespace
    const cleanedPhone = phone.replace(/\s+/g, "")

    // Basic validation for Nigerian numbers
    const nigeriaRegex = /^\+234[789]\d{9}$/
    const intlRegex = /^\+\d{1,4}\d{6,14}$/

    if (!cleanedPhone) {
      setPhoneError("Phone number is required")
      return false
    }

    if (!cleanedPhone.startsWith("+")) {
      setPhoneError("Phone number must start with country code (e.g., +234)")
      return false
    }

    if (cleanedPhone.startsWith("+234") && !nigeriaRegex.test(cleanedPhone)) {
      setPhoneError("Invalid Nigerian phone number. Format: +2348012345678")
      return false
    }

    if (!intlRegex.test(cleanedPhone)) {
      setPhoneError("Invalid phone number format")
      return false
    }

    setPhoneError("")
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validate phone number as user types
    if (name === "phone") {
      if (!value) {
        setPhoneError("")
      } else {
        validatePhoneNumber(value)
      }
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and +
    const filteredValue = value.replace(/[^\d+]/g, "")
    setFormData((prev) => ({ ...prev, phone: filteredValue }))
    validatePhoneNumber(filteredValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone number before submission
    if (!validatePhoneNumber(formData.phone)) {
      toast.error("Please fix phone number errors")
      return
    }

    setIsSaving(true)

    try {
      const updateData: UpdateProfileRequestNew = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        phone: formData.phone.trim(),
        homeAddress: formData.homeAddress.trim() || undefined,
      }

      await updateProfile.mutateAsync(updateData)

      // Redirect back to profile page
      router.push(`/${role}/profile`)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your personal information.</p>
      </div>

      <Card>
        <CardContent className="px-0 lg:px-6">
          <div className="mb-6 flex items-center gap-6 px-4 lg:px-0">
            <Avatar className="border-border h-20 w-20 border-2">
              <AvatarImage src={profile?.photo_url} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl">
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="my-6 px-4 text-lg font-medium lg:px-0">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6 px-4 lg:px-0">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Michael"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-muted-foreground text-sm">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+2348012345678"
                  required
                  pattern="^\+[1-9]\d{1,14}$"
                  title="Enter a valid phone number with country code (e.g., +2348012345678)"
                />
                {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                <p className="text-muted-foreground text-sm">
                  Format: +CountryCode Number (e.g., +2348012345678)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeAddress">Home Address</Label>
              <Input
                id="homeAddress"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                placeholder="12 Adeola Odeku Street, Victoria Island, Lagos"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${role}/profile`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white"
                disabled={isSaving || !!phoneError}
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
