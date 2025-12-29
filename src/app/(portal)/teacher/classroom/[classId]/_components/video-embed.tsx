"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface VideoEmbedProps {
  videoLinks: string[]
  onAddVideo: (url: string) => void
  onRemoveVideo: (url: string) => void
  isReadOnly?: boolean
}

function extractVideoId(url: string): {
  type: "youtube" | "vimeo" | "unknown"
  id: string
} {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return { type: "youtube", id: match[1] }
    }
  }

  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  const vimeoMatch = url.match(vimeoPattern)
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "vimeo", id: vimeoMatch[1] }
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

export function VideoEmbed({
  videoLinks,
  onAddVideo,
  onRemoveVideo,
  isReadOnly = false,
}: VideoEmbedProps) {
  const [videoUrl, setVideoUrl] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (videoUrl.trim()) {
      onAddVideo(videoUrl.trim())
      setVideoUrl("")
      setShowInput(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Video Resources</h3>
        {!isReadOnly && (
          <Button variant="outline" size="sm" onClick={() => setShowInput(!showInput)}>
            <Play className="mr-2 h-4 w-4" />
            Add Video
          </Button>
        )}
      </div>

      {showInput && !isReadOnly && (
        <div className="flex gap-2 rounded-lg border bg-white p-4">
          <Input
            placeholder="Enter YouTube or Vimeo URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
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
              setVideoUrl("")
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {videoLinks.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-500">No videos added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {videoLinks.map((url, index) => {
            const embedUrl = getEmbedUrl(url)

            if (!embedUrl) {
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {url}
                      </a>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveVideo(url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      src={embedUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Video ${index + 1}`}
                    />
                  </div>
                  {!isReadOnly && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveVideo(url)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
