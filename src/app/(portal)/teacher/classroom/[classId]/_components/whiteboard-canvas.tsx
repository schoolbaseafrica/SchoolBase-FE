"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import { Image as ImageIcon, Link as LinkIcon, Loader2, Trash2, Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TextBoxData } from "@/lib/whiteboard"
import { FloatingImage, FloatingVideo } from "./floating-media"
import { FloatingText } from "./floating-text"

import "@excalidraw/excalidraw/index.css"

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
)

interface MediaItem {
  id?: string
  url?: string
  x: number
  y: number
  width?: number
  height?: number
}

type PositionedMedia = Record<
  string,
  Required<Pick<MediaItem, "x" | "y" | "width" | "height">>
>

interface WhiteboardCanvasProps {
  canvasState: string | null
  elements?: Record<string, unknown>[]
  onSave: (canvasState: string) => void
  onElementsChange?: (elements: ReadonlyArray<Record<string, unknown>>) => void
  isLoading?: boolean
  isReadOnly?: boolean
  images?: string[]
  videoLinks?: string[]
  textBoxes?: TextBoxData[]
  imagesData?: Record<string, MediaItem>
  videosData?: Record<string, MediaItem>
  onAddImage?: (url: string) => void
  onRemoveImage?: (url: string) => void
  onAddVideo?: (url: string) => void
  onRemoveVideo?: (url: string) => void
  onAddTextBox?: (textBox: TextBoxData) => void
  onUpdateTextBox?: (id: string, updates: Partial<TextBoxData>) => void
  onRemoveTextBox?: (id: string) => void
  onUpdateImagesData?: (data: PositionedMedia) => void
  onUpdateVideosData?: (data: PositionedMedia) => void
  onClearAll?: () => void
}

type LegacyPath = {
  strokeColor?: string
  strokeWidth?: number
  paths?: Array<{ x: number; y: number }>
}

const sceneSignature = (elements: ReadonlyArray<Record<string, unknown>>) =>
  JSON.stringify(
    elements.map(({ id, version, versionNonce, isDeleted }) => ({
      id,
      version,
      versionNonce,
      isDeleted,
    }))
  )

const EXCALIDRAW_TYPES = new Set([
  "rectangle",
  "diamond",
  "ellipse",
  "line",
  "arrow",
  "freedraw",
  "text",
  "image",
  "frame",
  "magicframe",
  "embeddable",
  "iframe",
])

const isRenderableElement = (element: Record<string, unknown>) =>
  typeof element.id === "string" &&
  EXCALIDRAW_TYPES.has(String(element.type)) &&
  Number.isFinite(element.x) &&
  Number.isFinite(element.y) &&
  Number.isFinite(element.width) &&
  Number.isFinite(element.height)

async function importLegacyPaths(canvasState: string) {
  const paths = JSON.parse(canvasState) as LegacyPath[]
  if (!Array.isArray(paths)) return []
  const skeletons = paths.flatMap((path, index) => {
    if (!Array.isArray(path.paths)) return []
    const points = path.paths.filter(
      (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)
    )
    if (!points.length) return []
    const [origin, ...remaining] = points
    const relativePoints = [
      [0, 0],
      ...remaining.map((point) => [point.x - origin.x, point.y - origin.y]),
    ]
    if (relativePoints.length === 1) relativePoints.push([0.1, 0.1])
    return [
      {
        id: `legacy-stroke-${index}`,
        type: "freedraw" as const,
        x: origin.x,
        y: origin.y,
        points: relativePoints,
        strokeColor: path.strokeColor ?? "#000000",
        strokeWidth: Math.max(1, Math.min(20, Number(path.strokeWidth) || 2)),
      },
    ]
  })
  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
  return convertToExcalidrawElements(
    skeletons as unknown as Parameters<typeof convertToExcalidrawElements>[0],
    { regenerateIds: false }
  )
}

export function WhiteboardCanvas({
  canvasState,
  elements = [],
  onElementsChange,
  isLoading = false,
  isReadOnly = false,
  images = [],
  videoLinks = [],
  textBoxes = [],
  imagesData = {},
  videosData = {},
  onAddImage,
  onRemoveImage,
  onAddVideo,
  onRemoveVideo,
  onAddTextBox,
  onUpdateTextBox,
  onRemoveTextBox,
  onUpdateImagesData,
  onUpdateVideosData,
  onClearAll,
}: WhiteboardCanvasProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const migrationStarted = useRef(false)
  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSceneSignature = useRef("")
  const [videoUrl, setVideoUrl] = useState("")
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  const sceneElements = useMemo(
    () => elements.filter(isRenderableElement) as unknown as readonly ExcalidrawElement[],
    [elements]
  )

  useEffect(() => {
    const nextSignature = sceneSignature(elements)
    if (!apiRef.current || nextSignature === lastSceneSignature.current) return
    lastSceneSignature.current = nextSignature
    apiRef.current.updateScene({ elements: sceneElements })
  }, [elements, sceneElements])

  useEffect(() => {
    if (elements.length || !canvasState || migrationStarted.current || !onElementsChange)
      return
    migrationStarted.current = true
    void importLegacyPaths(canvasState)
      .then((imported) => {
        if (imported.length)
          onElementsChange(imported as unknown as Record<string, unknown>[])
      })
      .catch((error: unknown) =>
        console.error("Could not import legacy whiteboard strokes", error)
      )
  }, [canvasState, elements.length, onElementsChange])

  useEffect(
    () => () => {
      if (publishTimer.current) clearTimeout(publishTimer.current)
    },
    []
  )

  const publishElements = useCallback(
    (next: readonly ExcalidrawElement[]) => {
      if (isReadOnly || !onElementsChange) return
      const records = next as unknown as ReadonlyArray<Record<string, unknown>>
      const nextSignature = sceneSignature(records)
      if (nextSignature === lastSceneSignature.current) return
      lastSceneSignature.current = nextSignature
      if (publishTimer.current) clearTimeout(publishTimer.current)
      publishTimer.current = setTimeout(() => onElementsChange(records), 120)
    },
    [isReadOnly, onElementsChange]
  )

  const updateMedia = useCallback(
    (kind: "image" | "video", id: string, changes: Partial<MediaItem>) => {
      const urls = kind === "image" ? images : videoLinks
      const source = kind === "image" ? imagesData : videosData
      const update = kind === "image" ? onUpdateImagesData : onUpdateVideosData
      const index = Number(id.replace(kind === "image" ? "img-" : "vid-", ""))
      const url = urls[index]
      if (!url || !update) return
      const current = source[url] ?? { x: 50, y: 50 }
      update({
        ...source,
        [url]: {
          x: changes.x ?? current.x,
          y: changes.y ?? current.y,
          width: changes.width ?? current.width ?? (kind === "image" ? 200 : 400),
          height: changes.height ?? current.height ?? (kind === "image" ? 150 : 225),
        },
      } as PositionedMedia)
    },
    [images, videoLinks, imagesData, videosData, onUpdateImagesData, onUpdateVideosData]
  )

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !onAddImage) return
      const reader = new FileReader()
      reader.onloadend = () =>
        typeof reader.result === "string" && onAddImage(reader.result)
      reader.readAsDataURL(file)
      event.target.value = ""
    },
    [onAddImage]
  )

  const addTextBox = () =>
    onAddTextBox?.({
      id: `text-${crypto.randomUUID()}`,
      text: "",
      x: 80,
      y: 80,
      width: 220,
      height: 100,
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#000000",
    })

  const clearBoard = () => {
    if (isReadOnly) return
    const deleted = sceneElements.map((element) => ({
      ...element,
      isDeleted: true,
      version: element.version + 1,
      updated: Date.now(),
    }))
    apiRef.current?.updateScene({ elements: deleted })
    onElementsChange?.(deleted as unknown as Record<string, unknown>[])
    onClearAll?.()
    setSelectedElementId(null)
  }

  useEffect(() => {
    if (!selectedElementId || isReadOnly) return
    const removeSelected = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return
      const target = event.target as HTMLElement | null
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      )
        return
      event.preventDefault()
      if (selectedElementId.startsWith("img-")) {
        const url = images[Number(selectedElementId.slice(4))]
        if (url) onRemoveImage?.(url)
      } else if (selectedElementId.startsWith("vid-")) {
        const url = videoLinks[Number(selectedElementId.slice(4))]
        if (url) onRemoveVideo?.(url)
      } else if (selectedElementId.startsWith("text-")) {
        onRemoveTextBox?.(selectedElementId)
      }
      setSelectedElementId(null)
    }
    window.addEventListener("keydown", removeSelected)
    return () => window.removeEventListener("keydown", removeSelected)
  }, [
    images,
    isReadOnly,
    onRemoveImage,
    onRemoveTextBox,
    onRemoveVideo,
    selectedElementId,
    videoLinks,
  ])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      {!isReadOnly && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 px-3 py-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload image
          </Button>
          {showVideoInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="Paste video URL"
                className="h-8 w-48"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (videoUrl.trim()) onAddVideo?.(videoUrl.trim())
                  setVideoUrl("")
                  setShowVideoInput(false)
                }}
              >
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowVideoInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowVideoInput(true)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Add video
            </Button>
          )}
          {onAddTextBox && (
            <Button variant="outline" size="sm" onClick={addTextBox}>
              <Type className="mr-2 h-4 w-4" />
              Add text box
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearBoard}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear board
          </Button>
          <span className="text-muted-foreground ml-auto text-xs">
            Shapes, text and freehand drawing save collaboratively
          </span>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden bg-white">
        <Excalidraw
          initialData={{ elements: sceneElements }}
          excalidrawAPI={(api) => {
            apiRef.current = api
          }}
          onChange={(next) => publishElements(next)}
          viewModeEnabled={isReadOnly}
          zenModeEnabled
          gridModeEnabled={false}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
            },
          }}
        />

        {images.map((url, index) => {
          const data = imagesData[url] ?? { x: 50, y: 50, width: 200, height: 150 }
          const id = `img-${index}`
          return (
            <FloatingImage
              key={url}
              id={id}
              url={url}
              x={data.x}
              y={data.y}
              width={data.width ?? 200}
              height={data.height ?? 150}
              onRemove={() => onRemoveImage?.(url)}
              onPositionChange={(_, x, y) => updateMedia("image", id, { x, y })}
              onSizeChange={(_, width, height) =>
                updateMedia("image", id, { width, height })
              }
              onSelect={setSelectedElementId}
              isSelected={selectedElementId === id}
              isReadOnly={isReadOnly}
            />
          )
        })}
        {videoLinks.map((url, index) => {
          const data = videosData[url] ?? { x: 50, y: 50, width: 400, height: 225 }
          const id = `vid-${index}`
          return (
            <FloatingVideo
              key={url}
              id={id}
              url={url}
              x={data.x}
              y={data.y}
              width={data.width ?? 400}
              height={data.height ?? 225}
              onRemove={() => onRemoveVideo?.(url)}
              onPositionChange={(_, x, y) => updateMedia("video", id, { x, y })}
              onSizeChange={(_, width, height) =>
                updateMedia("video", id, { width, height })
              }
              onSelect={setSelectedElementId}
              isSelected={selectedElementId === id}
              isReadOnly={isReadOnly}
            />
          )
        })}
        {textBoxes.map((box) => (
          <FloatingText
            key={box.id}
            {...box}
            onRemove={() => onRemoveTextBox?.(box.id)}
            onPositionChange={(id, x, y) => onUpdateTextBox?.(id, { x, y })}
            onTextChange={(id, text) => onUpdateTextBox?.(id, { text })}
            onSizeChange={(id, width, height) => onUpdateTextBox?.(id, { width, height })}
            onStyleChange={(id, styles) => onUpdateTextBox?.(id, styles)}
            onSelect={setSelectedElementId}
            isSelected={selectedElementId === box.id}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  )
}
