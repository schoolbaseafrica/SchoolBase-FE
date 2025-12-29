"use client"

import Image from "next/image"
import { ResizableElement } from "./resizable-element"

interface FloatingImageProps {
  id: string
  url: string
  x: number
  y: number
  width?: number
  height?: number
  onRemove: () => void
  onPositionChange: (id: string, x: number, y: number) => void
  onSizeChange?: (id: string, width: number, height: number) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
  isReadOnly?: boolean
}

export function FloatingImage({
  id,
  url,
  x,
  y,
  width = 200,
  height = 150,
  onRemove,
  onPositionChange,
  onSizeChange,
  onSelect,
  isSelected = false,
  isReadOnly = false,
}: FloatingImageProps) {
  return (
    <ResizableElement
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      onRemove={onRemove}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange || (() => {})}
      onSelect={onSelect}
      isSelected={isSelected}
      isReadOnly={isReadOnly}
      minWidth={100}
      minHeight={80}
    >
      <div className="h-full w-full rounded-lg border-2 border-gray-300 bg-white p-1 shadow-lg">
        <div className="relative h-full w-full overflow-hidden rounded">
          <Image
            src={url}
            alt="Floating image"
            fill
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/assets/images/not-found.png"
            }}
          />
        </div>
      </div>
    </ResizableElement>
  )
}

interface FloatingVideoProps {
  id: string
  url: string
  x: number
  y: number
  width?: number
  height?: number
  onRemove: () => void
  onPositionChange: (id: string, x: number, y: number) => void
  onSizeChange?: (id: string, width: number, height: number) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
  isReadOnly?: boolean
}

function extractVideoId(url: string): {
  type: "youtube" | "vimeo" | "unknown"
  id: string
} {
  if (!url || typeof url !== "string") {
    return { type: "unknown", id: "" }
  }

  // YouTube patterns - more comprehensive matching
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*[&?]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return { type: "youtube", id: match[1] }
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/,
    /vimeo\.com\/(\d+)/,
  ]

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return { type: "vimeo", id: match[1] }
    }
  }

  return { type: "unknown", id: "" }
}

function getEmbedUrl(url: string): string | null {
  const { type, id } = extractVideoId(url)

  if (type === "youtube") {
    return `https://www.youtube.com/embed/${id}`
  }
  if (type === "vimeo") {
    return `https://player.vimeo.com/video/${id}`
  }

  return null
}

export function FloatingVideo({
  id,
  url,
  x,
  y,
  width = 400,
  height = 225,
  onRemove,
  onPositionChange,
  onSizeChange,
  onSelect,
  isSelected = false,
  isReadOnly = false,
}: FloatingVideoProps) {
  const embedUrl = getEmbedUrl(url)

  return (
    <ResizableElement
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      onRemove={onRemove}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange || (() => {})}
      onSelect={onSelect}
      isSelected={isSelected}
      isReadOnly={isReadOnly}
      minWidth={300}
      minHeight={200}
    >
      <div className="h-full w-full rounded-lg border-2 border-blue-300 bg-white p-1 shadow-lg">
        {embedUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded bg-black">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Video ${id}`}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm font-medium text-blue-600 hover:underline"
            >
              📹 {url}
            </a>
          </div>
        )}
      </div>
    </ResizableElement>
  )
}

// Keep old export for backward compatibility
export { FloatingVideo as FloatingVideoLink }
