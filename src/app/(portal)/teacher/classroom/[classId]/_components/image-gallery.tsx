"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  onAddImage: (url: string) => void
  onRemoveImage: (url: string) => void
  isReadOnly?: boolean
}

export function ImageGallery({
  images,
  onAddImage,
  onRemoveImage,
  isReadOnly = false,
}: ImageGalleryProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (imageUrl.trim()) {
      onAddImage(imageUrl.trim())
      setImageUrl("")
      setShowInput(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Image Gallery</h3>
        {!isReadOnly && (
          <Button variant="outline" size="sm" onClick={() => setShowInput(!showInput)}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        )}
      </div>

      {showInput && !isReadOnly && (
        <div className="flex gap-2 rounded-lg border bg-white p-4">
          <Input
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd()
              }
            }}
          />
          <Button onClick={handleAdd} size="sm">
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowInput(false)
              setImageUrl("")
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-500">No images added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <Image
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement
                      target.src = "/assets/images/not-found.png"
                    }}
                  />
                  {!isReadOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => onRemoveImage(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
