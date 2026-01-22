"use client"

import React, { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react"
import { Area } from "react-easy-crop/types"

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  aspectRatio?: number // e.g., 4/3, 16/9, 1 (square)
  minZoom?: number
  maxZoom?: number
  onCropComplete: (croppedImageBlob: Blob, croppedAreaPixels: Area) => void
  cropShape?: "rect" | "round"
  showGrid?: boolean
  title?: string
  description?: string
}

export function ImageCropper({
  open,
  onOpenChange,
  imageSrc,
  aspectRatio = 1,
  minZoom = 1,
  maxZoom = 3,
  onCropComplete,
  cropShape = "rect",
  showGrid = true,
  title = "Crop Image",
  description = "Adjust the image to your desired size and position",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation)
  }, [])

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.setAttribute("crossOrigin", "anonymous")
      image.src = url
    })

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    const rotRad = getRadianAngle(rotation)

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    )

    // Set canvas size to match bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // Translate canvas context to center of bounding box
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // Draw rotated image
    ctx.drawImage(image, 0, 0)

    // Extract cropped area
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    )

    // Set canvas size to final crop size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Paste the cropped image
    ctx.putImageData(data, 0, 0)

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Canvas to blob conversion failed"))
          }
        },
        "image/jpeg",
        0.95 // Quality (0-1)
      )
    })
  }

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) {
      return
    }

    setIsProcessing(true)
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      )
      onCropComplete(croppedImageBlob, croppedAreaPixels)
      onOpenChange(false)
      // Reset state
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedAreaPixels(null)
    } catch (error) {
      console.error("Error cropping image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset state
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl w-full"
        aria-describedby="image-cropper-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="image-cropper-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[400px] sm:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropAreaChange={onCropAreaChange}
            cropShape={cropShape}
            showGrid={showGrid}
            minZoom={minZoom}
            maxZoom={maxZoom}
          />
        </div>

        <div className="space-y-4">
          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4 text-gray-500" />
                <span>Zoom</span>
              </div>
              <span className="text-gray-600">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={minZoom}
              max={maxZoom}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-gray-500" />
                <span>Rotation</span>
              </div>
              <span className="text-gray-600">{rotation}°</span>
            </div>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => setRotation(value[0])}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCropComplete} disabled={isProcessing || !croppedAreaPixels}>
            <Check className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
