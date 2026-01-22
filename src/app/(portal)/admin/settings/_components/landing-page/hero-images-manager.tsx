"use client"

import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { Card, CardContent } from "@/components/ui/card"

interface HeroImage {
  id: string
  url: string
  alt: string
  order: number
}

interface HeroImagesManagerProps {
  images: HeroImage[]
  onImageUpload: (index: number, imageUrl: string) => Promise<void>
  disabled?: boolean
}

// Default hero images from /public/assets/landing
const DEFAULT_HERO_IMAGES = [
  "/assets/landing/hero-1.jpeg",
  "/assets/landing/hero-2.jpeg",
  "/assets/landing/hero-3.jpeg",
]

export function HeroImagesManager({
  images,
  onImageUpload,
  disabled = false,
}: HeroImagesManagerProps) {
  const handleUpload = async (index: number, imageUrl: string) => {
    await onImageUpload(index, imageUrl)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((index) => {
        const currentImage = images.find((img) => img.order === index)
        // Use default image if no custom image is set
        const displayImageUrl = currentImage?.url || DEFAULT_HERO_IMAGES[index]
        const isDefault = !currentImage?.url
        
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Hero Image {index + 1}
                </label>
                {isDefault && (
                  <p className="text-xs text-gray-500 mt-1">Using default image</p>
                )}
              </div>
              <ImageUploaderWithCrop
                currentImageUrl={displayImageUrl}
                onImageUploaded={async (url) => await handleUpload(index, url)}
                aspectRatio={16 / 9}
                minDimensions={{ width: 1200, height: 675 }}
                maxFileSizeMB={2}
                cropShape="rect"
                label={`Upload Hero Image ${index + 1}`}
                description="16:9 aspect ratio, min 1200x675px"
                disabled={disabled}
                showPreview={true}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
