"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { TestimonialEditor } from "./landing-page/testimonial-editor"
import { GalleryManager } from "./landing-page/gallery-manager"
import { HeroImagesManager } from "./landing-page/hero-images-manager"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { LandingPageAPI, type LandingPageConfig, type Testimonial } from "@/lib/landing-page"

export function LandingPageSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<LandingPageConfig>({
    hero_images: [],
    gallery_images: [],
    testimonials: [],
  })

  useEffect(() => {
    fetchLandingPageConfig()
  }, [])

  const fetchLandingPageConfig = async () => {
    setIsLoading(true)
    try {
      const response = await LandingPageAPI.getConfig()
      const configData = response.data?.landing_page_config || response.data
      if (configData) {
        setConfig(configData as LandingPageConfig)
      } else {
        // Initialize with empty config - defaults will be used in components
        setConfig({
          hero_images: [],
          gallery_images: [],
          testimonials: [],
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch landing page config:", error)
      toast.error(error?.message || "Failed to load landing page configuration")
      // Initialize with empty config on error - defaults will be used
      setConfig({
        hero_images: [],
        gallery_images: [],
        testimonials: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async (updatedConfig: LandingPageConfig) => {
    setIsSaving(true)
    try {
      const response = await LandingPageAPI.updateConfig(updatedConfig)
      const configData = response.data?.landing_page_config || response.data
      if (configData) {
        setConfig(configData as LandingPageConfig)
        toast.success("Landing page configuration saved successfully")
      }
    } catch (error: any) {
      console.error("Failed to save landing page config:", error)
      toast.error(error?.message || "Failed to save landing page configuration")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleHeroImageUpload = async (index: number, imageUrl: string) => {
    try {
      const newHeroImages = [...(config.hero_images || [])]
      if (newHeroImages[index]) {
        newHeroImages[index] = { ...newHeroImages[index], url: imageUrl }
      } else {
        newHeroImages[index] = { 
          id: `hero-${index}-${Date.now()}`, 
          url: imageUrl, 
          alt: `Hero image ${index + 1}`, 
          order: index 
        }
      }
      // Ensure we have exactly 3 slots
      while (newHeroImages.length < 3) {
        newHeroImages.push({ 
          id: `hero-${newHeroImages.length}-${Date.now()}`, 
          url: "", 
          alt: `Hero image ${newHeroImages.length + 1}`, 
          order: newHeroImages.length 
        })
      }
      const updatedConfig = { ...config, hero_images: newHeroImages }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  const handleGalleryImageAdd = async (imageUrl: string) => {
    try {
      const newImage = {
        id: `gallery-${Date.now()}`,
        url: imageUrl,
        alt: "Gallery image",
        order: (config.gallery_images || []).length,
      }
      const updatedConfig = {
        ...config,
        gallery_images: [...(config.gallery_images || []), newImage],
      }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  const handleGalleryImageRemove = async (imageId: string) => {
    try {
      const updatedConfig = {
        ...config,
        gallery_images: (config.gallery_images || []).filter((img) => img.id !== imageId),
      }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  const handleTestimonialAdd = async (testimonial: Omit<Testimonial, "id" | "order">) => {
    try {
      const newTestimonial = {
        ...testimonial,
        id: `testimonial-${Date.now()}`,
        order: (config.testimonials || []).length,
      }
      const updatedConfig = {
        ...config,
        testimonials: [...(config.testimonials || []), newTestimonial],
      }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  const handleTestimonialUpdate = async (testimonialId: string, updates: Partial<Testimonial>) => {
    try {
      const updatedConfig = {
        ...config,
        testimonials: (config.testimonials || []).map((t) =>
          t.id === testimonialId ? { ...t, ...updates } : t
        ),
      }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  const handleTestimonialRemove = async (testimonialId: string) => {
    try {
      const updatedConfig = {
        ...config,
        testimonials: (config.testimonials || []).filter((t) => t.id !== testimonialId),
      }
      await saveConfig(updatedConfig)
    } catch (error: any) {
      // Error already handled in saveConfig
    }
  }

  if (isLoading && config.hero_images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Landing Page Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your landing page images and testimonials. Images can be cropped and resized before upload.
        </p>
      </div>

      <Separator />

      {/* Hero Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Images</CardTitle>
          <CardDescription>
            Upload up to 3 hero images for your landing page. Recommended: 16:9 aspect ratio, minimum 1200x675px
          </CardDescription>
        </CardHeader>
        <CardContent>
            <HeroImagesManager
            images={config.hero_images || []}
            onImageUpload={(index, url) => handleHeroImageUpload(index, url)}
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Gallery Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>
            Add images to your gallery section. Recommended: 1:1 (square) or 4:3 aspect ratio, minimum 800x800px
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryManager
            images={config.gallery_images || []}
            onImageAdd={handleGalleryImageAdd}
            onImageRemove={handleGalleryImageRemove}
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Manage testimonials displayed on your landing page. Each testimonial includes a quote, name, role, and avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialEditor
            testimonials={config.testimonials || []}
            onAdd={handleTestimonialAdd}
            onUpdate={handleTestimonialUpdate}
            onRemove={handleTestimonialRemove}
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
