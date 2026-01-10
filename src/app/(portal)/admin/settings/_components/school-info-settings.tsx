"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { useSchoolStore } from "@/store/use-school-store"

interface SchoolData {
  id: string
  name: string
  address?: string
  email?: string
  phone?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  installation_completed: boolean
}

export const SchoolInfoSettings = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadConfig, school } = useSchoolStore()

  const [formData, setFormData] = useState({
    schoolName: "",
    primaryColor: "#DA3743",
    secondaryColor: "",
    accentColor: "",
    phone: "",
    address: "",
    email: "",
  })

  // Load current school data on mount
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setIsLoading(true)
        // Use proxy route to dynamically construct backend URL from request headers
        // This ensures we always call the correct school's backend API
        const response = await fetch("/api/proxy-auth/school", {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch school data: ${response.statusText}`)
        }

        const responseData = await response.json()
        // Handle wrapped response: {status_code, message, data} or direct data
        const schoolData = responseData?.data || responseData

        if (schoolData && typeof schoolData === "object") {
          setFormData({
            schoolName: schoolData.name || "",
            primaryColor: schoolData.primary_color || "#DA3743",
            secondaryColor: schoolData.secondary_color || "",
            accentColor: schoolData.accent_color || "",
            phone: schoolData.phone || "",
            address: schoolData.address || "",
            email: schoolData.email || "",
          })

          // Set logo preview if logo URL exists
          if (schoolData.logo_url) {
            // Logo URL from backend should already be absolute or relative
            // If it's relative, construct the backend URL dynamically
            let logoUrl = schoolData.logo_url
            if (!logoUrl.startsWith("http")) {
              // Construct backend URL from current origin (same as config-loader)
              const protocol = window.location.protocol
              const hostname = window.location.hostname
              
              let backendHostname: string
              
              if (hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
                // Check if hostname already starts with 'api.'
                if (hostname.startsWith("api.")) {
                  backendHostname = hostname
                } else {
                  // Prepend 'api.' to the hostname
                  // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
                  backendHostname = `api.${hostname}`
                }
              } else {
                backendHostname = hostname
              }
              
              const backendOrigin = `${protocol}//${backendHostname}${hostname === "localhost" ? `:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3008}` : ""}`
              // Ensure proper path concatenation - add leading slash if missing
              logoUrl = logoUrl.startsWith("/") 
                ? `${backendOrigin}${logoUrl}`
                : `${backendOrigin}/${logoUrl}`
            }
            setLogoPreview(logoUrl)
          }
        }
      } catch (error) {
        console.error("Failed to load school data:", error)
        toast.error("Failed to load school information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolData()
  }, [])

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

    try {
      // Build FormData for multipart/form-data request (supports file upload)
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append("name", formData.schoolName)
      if (formData.address) formDataToSend.append("address", formData.address)
      if (formData.email) formDataToSend.append("email", formData.email)
      if (formData.phone) formDataToSend.append("phone", formData.phone)
      if (formData.primaryColor)
        formDataToSend.append("primary_color", formData.primaryColor)
      if (formData.secondaryColor)
        formDataToSend.append("secondary_color", formData.secondaryColor)
      if (formData.accentColor)
        formDataToSend.append("accent_color", formData.accentColor)

      // Add logo file if provided
      if (logoFile) {
        formDataToSend.append("logo", logoFile)
      }

      // Make PATCH request to update school
      // Use /school (without /api/v1) when proxy=true, as the proxy route will prepend /api/v1
      const response = await apiFetch<{ data: SchoolData }>(
        "/school",
        {
          method: "PATCH",
          data: formDataToSend,
        },
        true // Use proxy for authenticated request
      )

      const updatedSchool = response?.data || response

      // Update form fields with the response data
      if (updatedSchool) {
        setFormData({
          schoolName: updatedSchool.name || formData.schoolName,
          primaryColor: updatedSchool.primary_color || formData.primaryColor,
          secondaryColor: updatedSchool.secondary_color || formData.secondaryColor,
          accentColor: updatedSchool.accent_color || formData.accentColor,
          phone: updatedSchool.phone || formData.phone,
          address: updatedSchool.address || formData.address,
          email: updatedSchool.email || formData.email,
        })

        // Update logo preview if logo URL changed
        // Construct backend URL dynamically from current origin (same as config-loader)
        if (updatedSchool.logo_url) {
          let logoUrl = updatedSchool.logo_url
          if (!logoUrl.startsWith("http")) {
            const protocol = window.location.protocol
            const hostname = window.location.hostname
            
            let backendHostname: string
            
            if (hostname !== "localhost" && !hostname.startsWith("127.0.0.1")) {
              // Check if hostname already starts with 'api.'
              if (hostname.startsWith("api.")) {
                backendHostname = hostname
              } else {
                // Prepend 'api.' to the hostname
                // e.g., stpaul.schoolbase.africa -> api.stpaul.schoolbase.africa
                backendHostname = `api.${hostname}`
              }
            } else {
              backendHostname = hostname
            }
            
            const backendOrigin = `${protocol}//${backendHostname}${hostname === "localhost" ? `:${process.env.NEXT_PUBLIC_BACKEND_PORT || 3008}` : ""}`
            // Ensure proper path concatenation - add leading slash if missing
            logoUrl = logoUrl.startsWith("/") 
              ? `${backendOrigin}${logoUrl}`
              : `${backendOrigin}/${logoUrl}`
          }
          setLogoPreview(logoUrl)
        }

        // Clear the file input since we've uploaded it
        setLogoFile(null)
      }

      toast.success("School information updated successfully")

      // Force reload school config to update the UI theme/branding immediately
      await loadConfig(true)
    } catch (error) {
      console.error("Failed to update school:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update school information"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading school information...</p>
        </div>
      </div>
    )
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
              <Label htmlFor="primaryColor">
                Primary Brand Color <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="primaryColorText"
                  name="primaryColor"
                  value={formData.primaryColor}
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
              <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor || "#8B5CF6"}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="secondaryColorText"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Secondary color for accents and highlights
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-4">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    name="accentColor"
                    value={formData.accentColor || "#36D399"}
                    onChange={handleChange}
                    className="absolute -top-2 -left-2 h-16 w-20 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  id="accentColorText"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  placeholder="#36D399"
                  className="flex-1"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Accent color for special UI elements
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
              <Label htmlFor="email">
                School Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@school.edu"
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
