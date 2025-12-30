"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ReactSketchCanvas } from "react-sketch-canvas"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Trash2,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Type,
  Pen,
  Undo2,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingImage, FloatingVideo } from "./floating-media"
import { FloatingText } from "./floating-text"

interface MediaItem {
  id: string
  url: string
  x: number
  y: number
}

// Import TextBoxData from the shared type definition
import type { TextBoxData } from "@/lib/whiteboard"

interface WhiteboardCanvasProps {
  canvasState: string | null
  onSave: (canvasState: string) => void
  isLoading?: boolean
  isReadOnly?: boolean
  images?: string[]
  videoLinks?: string[]
  textBoxes?: TextBoxData[]
  imagesData?: Record<
    string,
    MediaItem | { x: number; y: number; width: number; height: number }
  >
  videosData?: Record<
    string,
    MediaItem | { x: number; y: number; width: number; height: number }
  >
  onAddImage?: (url: string) => void
  onRemoveImage?: (url: string) => void
  onAddVideo?: (url: string) => void
  onRemoveVideo?: (url: string) => void
  onAddTextBox?: (textBox: TextBoxData) => void
  onUpdateTextBox?: (id: string, updates: Partial<TextBoxData>) => void
  onRemoveTextBox?: (id: string) => void
  onUpdateImagesData?: (
    data: Record<string, { x: number; y: number; width: number; height: number }>
  ) => void
  onUpdateVideosData?: (
    data: Record<string, { x: number; y: number; width: number; height: number }>
  ) => void
  onClearAll?: () => void
}

export function WhiteboardCanvas({
  canvasState,
  onSave,
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
  const canvasRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [videoUrl, setVideoUrl] = useState("")
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isPenToolActive, setIsPenToolActive] = useState(false)

  // Get selected text box for style controls
  const selectedTextBox = textBoxes.find((tb) => tb.id === selectedElementId)

  // Use provided data from props (loaded from backend)
  const imageData = imagesData
  const videoData = videosData

  // Load canvas state when it changes
  useEffect(() => {
    if (canvasState && canvasRef.current) {
      try {
        // Parse the JSON string to CanvasPath array
        const paths = JSON.parse(canvasState)
        if (Array.isArray(paths)) {
          canvasRef.current.loadPaths(paths)
        }
      } catch (error) {
        console.error("Error loading canvas paths:", error)
      }
    }
  }, [canvasState])

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || isReadOnly) return
    try {
      const paths = await canvasRef.current.exportPaths()
      const pathsString = JSON.stringify(paths)
      onSave(pathsString)
    } catch (error) {
      console.error("Error exporting canvas:", error)
    }
  }, [onSave, isReadOnly])

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleUndo = useCallback(() => {
    if (canvasRef.current && !isReadOnly) {
      canvasRef.current.undo()
      handleExport() // Save after undo
    }
  }, [handleExport, isReadOnly])

  const handleClearDrawings = useCallback(() => {
    if (canvasRef.current && !isReadOnly) {
      canvasRef.current.clearCanvas()
      handleExport() // Save after clear
    }
  }, [handleExport, isReadOnly])

  const handleClear = () => {
    if (canvasRef.current && !isReadOnly) {
      canvasRef.current.clearCanvas()
      handleExport()
      // Clear all floating elements via parent callback (which saves to backend)
      if (onClearAll) {
        onClearAll()
      } else {
        // Fallback: clear locally if callback not provided
        if (onRemoveImage) {
          images.forEach((url) => onRemoveImage(url))
        }
        if (onRemoveVideo) {
          videoLinks.forEach((url) => onRemoveVideo(url))
        }
        if (onRemoveTextBox) {
          textBoxes.forEach((tb) => onRemoveTextBox(tb.id))
        }
      }
      setSelectedElementId(null)
    }
  }

  // Handle keyboard delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReadOnly) return

      // Handle Delete or Backspace key (only if not typing in an input/textarea)
      const target = e.target as HTMLElement
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      // If Ctrl/Cmd + Z, undo last stroke on canvas
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && !isInputElement) {
        e.preventDefault()
        if (canvasRef.current) {
          canvasRef.current.undo()
          handleExport() // Save after undo
        }
        return
      }

      // If Delete/Backspace with selected element, delete that element
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementId &&
        !isInputElement
      ) {
        e.preventDefault()
        e.stopPropagation()

        // Determine element type and remove
        if (selectedElementId.startsWith("img-")) {
          const index = parseInt(selectedElementId.replace("img-", ""))
          if (!isNaN(index) && images[index] && onRemoveImage) {
            onRemoveImage(images[index])
          }
        } else if (selectedElementId.startsWith("vid-")) {
          const index = parseInt(selectedElementId.replace("vid-", ""))
          if (!isNaN(index) && videoLinks[index] && onRemoveVideo) {
            onRemoveVideo(videoLinks[index])
          }
        } else if (selectedElementId.startsWith("text-")) {
          if (onRemoveTextBox) {
            onRemoveTextBox(selectedElementId)
          }
        }

        setSelectedElementId(null)
        return
      }

      // If Delete/Backspace without selected element and canvas is focused, undo last stroke
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !selectedElementId &&
        !isInputElement
      ) {
        // Check if the click target was the canvas
        const isCanvasFocused =
          document.activeElement?.tagName === "CANVAS" ||
          target.closest(".react-sketch-canvas") !== null
        if (isCanvasFocused && canvasRef.current) {
          e.preventDefault()
          canvasRef.current.undo()
          handleExport() // Save after undo
        }
      }

      // Clear selection on Escape
      if (e.key === "Escape") {
        setSelectedElementId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    selectedElementId,
    images,
    videoLinks,
    textBoxes,
    onRemoveImage,
    onRemoveVideo,
    onRemoveTextBox,
    isReadOnly,
  ])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !onAddImage) return

      // Convert file to base64 data URL for persistence
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (base64String) {
          onAddImage(base64String)
        }
      }
      reader.readAsDataURL(file)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [onAddImage]
  )

  const handleAddVideo = useCallback(() => {
    if (videoUrl.trim() && onAddVideo) {
      onAddVideo(videoUrl.trim())
      setVideoUrl("")
      setShowVideoInput(false)
    }
  }, [videoUrl, onAddVideo])

  const handleImagePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      const index = parseInt(id.replace("img-", ""))
      if (!isNaN(index) && images[index] && onUpdateImagesData) {
        const url = images[index]
        const existing = imagesData[url] as any
        const updatedData = {
          ...imagesData,
          [url]: {
            ...existing,
            x,
            y,
            width: existing?.width || 200,
            height: existing?.height || 200,
          },
        }
        onUpdateImagesData(
          updatedData as Record<
            string,
            { x: number; y: number; width: number; height: number }
          >
        )
      }
    },
    [images, imagesData, onUpdateImagesData]
  )

  const handleImageSizeChange = useCallback(
    (id: string, width: number, height: number) => {
      const index = parseInt(id.replace("img-", ""))
      if (!isNaN(index) && images[index] && onUpdateImagesData) {
        const url = images[index]
        const existing = imagesData[url] as any
        const updatedData = {
          ...imagesData,
          [url]: { ...existing, x: existing?.x || 0, y: existing?.y || 0, width, height },
        }
        onUpdateImagesData(
          updatedData as Record<
            string,
            { x: number; y: number; width: number; height: number }
          >
        )
      }
    },
    [images, imagesData, onUpdateImagesData]
  )

  const handleVideoPositionChange = useCallback(
    (id: string, x: number, y: number) => {
      const index = parseInt(id.replace("vid-", ""))
      if (!isNaN(index) && videoLinks[index] && onUpdateVideosData) {
        const url = videoLinks[index]
        const existing = videosData[url] as any
        const updatedData = {
          ...videosData,
          [url]: {
            ...existing,
            x,
            y,
            width: existing?.width || 400,
            height: existing?.height || 225,
          },
        }
        onUpdateVideosData(
          updatedData as Record<
            string,
            { x: number; y: number; width: number; height: number }
          >
        )
      }
    },
    [videoLinks, videosData, onUpdateVideosData]
  )

  const handleVideoSizeChange = useCallback(
    (id: string, width: number, height: number) => {
      const index = parseInt(id.replace("vid-", ""))
      if (!isNaN(index) && videoLinks[index] && onUpdateVideosData) {
        const url = videoLinks[index]
        const existing = videosData[url] as any
        const updatedData = {
          ...videosData,
          [url]: {
            ...existing,
            x: existing?.x || 0,
            y: existing?.y || 0,
            width,
            height,
          },
        }
        onUpdateVideosData(
          updatedData as Record<
            string,
            { x: number; y: number; width: number; height: number }
          >
        )
      }
    },
    [videoLinks, videosData, onUpdateVideosData]
  )

  const handleAddTextBox = useCallback(() => {
    if (!onAddTextBox) return
    const newTextBox: TextBoxData = {
      id: `text-${Date.now()}`,
      text: "",
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: 200,
      height: 100,
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#000000",
    }
    onAddTextBox(newTextBox)
  }, [onAddTextBox])

  const handleTextBoxPositionChange = useCallback(
    (id: string, x: number, y: number) => {
      onUpdateTextBox?.(id, { x, y })
    },
    [onUpdateTextBox]
  )

  const handleTextBoxSizeChange = useCallback(
    (id: string, width: number, height: number) => {
      onUpdateTextBox?.(id, { width, height })
    },
    [onUpdateTextBox]
  )

  const handleTextBoxTextChange = useCallback(
    (id: string, text: string) => {
      onUpdateTextBox?.(id, { text })
    },
    [onUpdateTextBox]
  )

  const handleTextBoxStyleChange = useCallback(
    (
      id: string,
      styles: {
        fontSize?: number
        fontFamily?: string
        fontWeight?: string
        color?: string
      }
    ) => {
      onUpdateTextBox?.(id, styles)
    },
    [onUpdateTextBox]
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col">
      {/* Toolbar */}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 px-4 py-2">
          <Button
            variant={isPenToolActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPenToolActive(!isPenToolActive)}
            className="h-8"
          >
            <Pen className="mr-2 h-3 w-3" />
            Pen Tool
          </Button>

          {isPenToolActive && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Label htmlFor="color" className="text-xs font-medium">
                  Color:
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-8 w-16 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="width" className="text-xs font-medium">
                  Width:
                </Label>
                <Input
                  id="width"
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-gray-600">{strokeWidth}px</span>
              </div>

              <div className="h-6 w-px bg-gray-300" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                className="h-8"
                title="Undo last stroke (Ctrl+Z)"
              >
                <Undo2 className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearDrawings}
                className="h-8"
                title="Clear all drawings"
              >
                <X className="mr-2 h-3 w-3" />
                Clear Drawings
              </Button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8"
          >
            <ImageIcon className="mr-2 h-3 w-3" />
            Upload Image
          </Button>

          {showVideoInput ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Paste video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddVideo()
                }}
                className="h-8 w-48 text-xs"
              />
              <Button size="sm" onClick={handleAddVideo} className="h-8">
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowVideoInput(false)
                  setVideoUrl("")
                }}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoInput(true)}
              className="h-8"
            >
              <LinkIcon className="mr-2 h-3 w-3" />
              Add Video Link
            </Button>
          )}

          <div className="h-6 w-px bg-gray-300" />

          {!isReadOnly && onAddTextBox && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTextBox}
                className="h-8"
              >
                <Type className="mr-2 h-3 w-3" />
                Add Text Box
              </Button>
              <div className="h-6 w-px bg-gray-300" />
            </>
          )}

          {/* Text Box Style Controls - Only show when a text box is selected */}
          {selectedTextBox && !isReadOnly && onUpdateTextBox && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Label htmlFor="text-size" className="text-xs font-medium">
                  Size:
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    const newSize = Math.max(8, (selectedTextBox.fontSize || 16) - 2)
                    onUpdateTextBox(selectedTextBox.id, { fontSize: newSize })
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded border text-xs hover:bg-gray-100"
                  title="Decrease size"
                >
                  −
                </button>
                <Input
                  id="text-size"
                  type="number"
                  min="8"
                  max="120"
                  value={selectedTextBox.fontSize || 16}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value) || 16
                    onUpdateTextBox(selectedTextBox.id, { fontSize: newSize })
                  }}
                  className="h-8 w-16 text-center text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSize = Math.min(120, (selectedTextBox.fontSize || 16) + 2)
                    onUpdateTextBox(selectedTextBox.id, { fontSize: newSize })
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded border text-xs hover:bg-gray-100"
                  title="Increase size"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="text-font" className="text-xs font-medium">
                  Font:
                </Label>
                <select
                  id="text-font"
                  value={selectedTextBox.fontFamily || "Arial"}
                  onChange={(e) => {
                    onUpdateTextBox(selectedTextBox.id, { fontFamily: e.target.value })
                  }}
                  className="h-8 rounded border px-2 text-xs"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Courier New">Courier</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Comic Sans MS">Comic</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="text-weight" className="text-xs font-medium">
                  Weight:
                </Label>
                <select
                  id="text-weight"
                  value={selectedTextBox.fontWeight || "normal"}
                  onChange={(e) => {
                    onUpdateTextBox(selectedTextBox.id, { fontWeight: e.target.value })
                  }}
                  className="h-8 rounded border px-2 text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="text-color" className="text-xs font-medium">
                  Color:
                </Label>
                <Input
                  id="text-color"
                  type="color"
                  value={selectedTextBox.color || "#000000"}
                  onChange={(e) => {
                    onUpdateTextBox(selectedTextBox.id, { color: e.target.value })
                  }}
                  className="h-8 w-16 cursor-pointer"
                />
              </div>
              <div className="h-6 w-px bg-gray-300" />
            </>
          )}

          <Button variant="outline" size="sm" onClick={handleClear} className="h-8">
            <Trash2 className="mr-2 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {/* Whiteboard Canvas with Floating Media */}
      <div
        className="relative flex-1 overflow-hidden bg-white"
        onClick={(e) => {
          // Clear selection when clicking on empty canvas
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).tagName === "CANVAS"
          ) {
            setSelectedElementId(null)
          }
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          width="100%"
          height="100%"
          exportWithBackgroundImage={false}
          className={isReadOnly ? "cursor-default" : ""}
          style={{
            border: "none",
            cursor: isReadOnly
              ? "default"
              : isPenToolActive
                ? 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23000" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.84 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/></svg>\') 0 24, auto'
                : "default",
          }}
          allowOnlyPointerType={isReadOnly || !isPenToolActive ? "none" : "all"}
          withTimestamp={true}
          {...(isReadOnly || !isPenToolActive
            ? {}
            : {
                // Note: onStroke may not be available in react-sketch-canvas
                // Auto-save is handled via useEffect instead
              })}
        />

        {/* Floating Images */}
        {images.map((url, index) => {
          const data = imageData[url] || { x: 50, y: 50, width: 200, height: 150 }
          const elementId = `img-${index}`
          return (
            <FloatingImage
              key={url}
              id={elementId}
              url={url}
              x={data.x}
              y={data.y}
              width={(data as any).width || 200}
              height={(data as any).height || 200}
              onRemove={() => onRemoveImage?.(url)}
              onPositionChange={handleImagePositionChange}
              onSizeChange={handleImageSizeChange}
              onSelect={setSelectedElementId}
              isSelected={selectedElementId === elementId}
              isReadOnly={isReadOnly}
            />
          )
        })}

        {/* Floating Videos */}
        {videoLinks.map((url, index) => {
          const data = videoData[url] || { x: 50, y: 50, width: 400, height: 225 }
          const elementId = `vid-${index}`
          return (
            <FloatingVideo
              key={url}
              id={elementId}
              url={url}
              x={data.x}
              y={data.y}
              width={(data as any).width || 200}
              height={(data as any).height || 200}
              onRemove={() => onRemoveVideo?.(url)}
              onPositionChange={handleVideoPositionChange}
              onSizeChange={handleVideoSizeChange}
              onSelect={setSelectedElementId}
              isSelected={selectedElementId === elementId}
              isReadOnly={isReadOnly}
            />
          )
        })}

        {/* Floating Text Boxes */}
        {textBoxes.map((textBox) => (
          <FloatingText
            key={textBox.id}
            id={textBox.id}
            text={textBox.text}
            x={textBox.x}
            y={textBox.y}
            width={textBox.width}
            height={textBox.height}
            fontSize={textBox.fontSize}
            fontFamily={textBox.fontFamily}
            fontWeight={textBox.fontWeight}
            color={textBox.color}
            onRemove={() => onRemoveTextBox?.(textBox.id)}
            onPositionChange={handleTextBoxPositionChange}
            onTextChange={handleTextBoxTextChange}
            onSizeChange={handleTextBoxSizeChange}
            onStyleChange={handleTextBoxStyleChange}
            onSelect={setSelectedElementId}
            isSelected={selectedElementId === textBox.id}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  )
}
