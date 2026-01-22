"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageUploaderWithCrop } from "@/components/image-upload/image-uploader-with-crop"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface GalleryImage {
  id: string
  url: string
  alt: string
  order: number
}

interface GalleryManagerProps {
  images: GalleryImage[]
  onImageAdd: (imageUrl: string) => Promise<void>
  onImageRemove: (imageId: string) => Promise<void>
  disabled?: boolean
}

export function GalleryManager({
  images,
  onImageAdd,
  onImageRemove,
  disabled = false,
}: GalleryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async (imageUrl: string) => {
    await onImageAdd(imageUrl)
    setIsAdding(false)
  }

  const handleRemove = async (imageId: string) => {
    if (confirm("Are you sure you want to remove this image?")) {
      await onImageRemove(imageId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(image.id)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Image */}
      {isAdding ? (
        <Card>
          <CardContent className="p-4">
            <ImageUploaderWithCrop
              onImageUploaded={handleAdd}
              aspectRatio={1}
              minDimensions={{ width: 800, height: 800 }}
              maxFileSizeMB={1.5}
              cropShape="rect"
              label="Upload Gallery Image"
              description="1:1 (square) or 4:3 aspect ratio, min 800x800px"
              disabled={disabled}
              showPreview={false}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(false)}
              className="mt-4"
              disabled={disabled}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gallery Image
        </Button>
      )}
    </div>
  )
}
