"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "./image-cropper"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Area } from "react-easy-crop"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploaderWithCropProps {
  currentImageUrl?: string | null
  onImageUploaded: (imageUrl: string, imageBlob?: Blob) => Promise<void> | void
  aspectRatio?: number
  minDimensions?: { width: number; height: number }
  maxFileSizeMB?: number
  allowedTypes?: string[]
  cropShape?: "rect" | "round"
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

export function ImageUploaderWithCrop({
  currentImageUrl,
  onImageUploaded,
  aspectRatio = 1,
  minDimensions,
  maxFileSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  cropShape = "rect",
  label = "Upload Image",
  description,
  className,
  disabled = false,
  showPreview = true,
}: ImageUploaderWithCropProps) {
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
    }

    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxFileSizeMB}MB limit`
    }

    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImageSrc(result)
      setIsCropperOpen(true)
    }
    reader.onerror = () => {
      toast.error("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImageBlob: Blob, croppedAreaPixels: Area) => {
    setIsUploading(true)
    try {
      // Validate dimensions if required
      if (minDimensions) {
        if (
          croppedAreaPixels.width < minDimensions.width ||
          croppedAreaPixels.height < minDimensions.height
        ) {
          toast.error(
            `Image dimensions must be at least ${minDimensions.width}x${minDimensions.height}px`
          )
          setIsUploading(false)
          return
        }
      }

      // Convert blob to File for upload
      const croppedFile = new File(
        [croppedImageBlob],
        `cropped-image-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      )

      // Upload the cropped image
      const { uploadToCloudinary } = await import("@/lib/api/utils/upload-photo")
      const response = await uploadToCloudinary(croppedFile)
      const imageUrl = response.data?.url || (response as any).url

      if (!imageUrl) {
        throw new Error("Failed to get image URL from upload response")
      }

      // Call the callback
      await onImageUploaded(imageUrl, croppedImageBlob)

      toast.success("Image uploaded successfully")
    } catch (error: any) {
      console.error("Error uploading cropped image:", error)
      toast.error(error?.message || "Failed to upload image")
    } finally {
      setIsUploading(false)
      setIsCropperOpen(false)
      setImageSrc(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = async () => {
    try {
      await onImageUploaded("", undefined)
      toast.success("Image removed")
    } catch (error: any) {
      console.error("Error removing image:", error)
      toast.error(error?.message || "Failed to remove image")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showPreview && currentImageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={currentImageUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={currentImageUrl.startsWith('/landing/') || currentImageUrl.startsWith('/assets/') || currentImageUrl.startsWith('http://') || currentImageUrl.startsWith('https://')}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {(!showPreview || !currentImageUrl) && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mb-4">{description}</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Select Image"}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {imageSrc && (
        <ImageCropper
          open={isCropperOpen}
          onOpenChange={setIsCropperOpen}
          imageSrc={imageSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          cropShape={cropShape}
          title="Crop Image"
          description={
            minDimensions
              ? `Crop your image. Minimum size: ${minDimensions.width}x${minDimensions.height}px`
              : "Adjust the image to your desired size and position"
          }
        />
      )}
    </div>
  )
}
