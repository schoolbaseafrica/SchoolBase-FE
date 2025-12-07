"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export const SchoolInfoSettings = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    schoolName: "",
    brandColor: "#DA3743",
    phone: "",
    address: "",
  })

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
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
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

    // Simulate API call with logo upload
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Here you would upload logoFile to your backend
      if (logoFile) {
        console.log("Logo file to upload:", logoFile.name)
      }
      toast.success("School information updated successfully")
    } catch {
      toast.error("Failed to update school information")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">School Information</h2>
        <p className="text-muted-foreground">Manage your school information.</p>
      </div>

      <Card>
        <CardContent className="space-y-6 px-0 lg:px-6">
          <div className="space-y-4 px-4 lg:px-0">
            <div>
              <h3 className="text-base font-semibold">School Logo</h3>
              <p className="text-muted-foreground text-sm">Update your School logo</p>
            </div>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={logoPreview || ""}
                  alt="School Logo"
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted">LOGO</AvatarFallback>
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
                className="gap-2 border text-sm text-[#535353] hover:border-2 hover:bg-white"
              >
                Change photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-4 lg:px-0">
            <div className="space-y-2">
              <Label htmlFor="schoolName">
                School Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. School Folio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandColor">
                Primary Brand Color <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="brandColor"
                    value={formData.brandColor}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="brandColorText"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  placeholder="#DA3743"
                  className="flex-1"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                This color will be used throughout your portal interface
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                School Phone No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(000) 000-000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
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
