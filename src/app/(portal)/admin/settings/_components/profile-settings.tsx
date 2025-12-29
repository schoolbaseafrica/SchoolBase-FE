"use client"

import { useState, useEffect, useRef } from "react"
import { useGetProfile, useUpdateProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ItemLoader } from "../../_components/sub-loader"
import { getPhotoUrl } from "@/lib/api/utils/upload-photo"

export const ProfileSettings = () => {
  const { data: profile, isLoading } = useGetProfile()
  const updateProfileMutation = useUpdateProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    countryCode: "+234",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (profile) {
      // Extract country code from phone if it starts with +
      const phone = profile.phone || ""
      let countryCode = "+234"
      let phoneNumber = phone

      if (phone.startsWith("+234")) {
        countryCode = "+234"
        phoneNumber = phone.substring(4)
      } else if (phone.startsWith("+1")) {
        countryCode = "+1"
        phoneNumber = phone.substring(2)
      } else if (phone.startsWith("+44")) {
        countryCode = "+44"
        phoneNumber = phone.substring(3)
      } else if (phone.startsWith("+91")) {
        countryCode = "+91"
        phoneNumber = phone.substring(3)
      } else if (phone.startsWith("+86")) {
        countryCode = "+86"
        phoneNumber = phone.substring(3)
      }

      setFormData({
        firstName: profile.first_name || "",
        middleName: profile.middle_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        countryCode: countryCode,
        phone: phoneNumber,
        address: profile.homeAddress || "",
      })

      // Set avatar preview if photo_url exists
      if (profile.photo_url) {
        setAvatarPreview(profile.photo_url)
      }
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Combine country code and phone number
      const fullPhone = formData.countryCode + formData.phone

      // If avatar file is provided, upload it first to get the URL
      let photoUrl = profile?.photo_url
      if (avatarFile) {
        try {
          photoUrl = await getPhotoUrl(avatarFile)
        } catch (uploadError) {
          console.error("Failed to upload photo:", uploadError)
          toast.error("Failed to upload photo, but will continue with profile update")
        }
      }

      // Update profile with all fields
      await updateProfileMutation.mutateAsync({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        middle_name: formData.middleName.trim() || null,
        phone: fullPhone.trim(),
        homeAddress: formData.address.trim() || undefined,
        photo_url: photoUrl,
      })

      // Clear avatar file after successful upload
      if (avatarFile && fileInputRef.current) {
        fileInputRef.current.value = ""
        setAvatarFile(null)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      // Error is already handled by the mutation's onError
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <ItemLoader item="profile" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your School and personal information.
        </p>
      </div>

      <Card>
        <CardContent className="px-0 lg:px-6">
          <div className="flex items-center gap-6 px-4 lg:px-0">
            <Avatar className="border-border h-20 w-20 border-2">
              <AvatarImage
                src={avatarPreview || profile?.photo_url}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-xl">
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePhotoClick}
              className="text-muted-foreground hover:bg-muted gap-2 border text-sm hover:border-2"
            >
              Change photo
            </Button>
          </div>

          <h2 className="my-6 px-4 text-lg font-medium lg:px-0">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6 px-4 lg:px-0">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone No.</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, countryCode: value }))
                    }
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+234">+234</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                      <SelectItem value="+91">+91</SelectItem>
                      <SelectItem value="+86">+86</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1"
                    placeholder="8123456789"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="5 Ajayi Close Ikeja, Lagos."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
