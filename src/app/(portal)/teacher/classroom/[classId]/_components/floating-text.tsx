"use client"

import { useState, useEffect } from "react"
import { ResizableElement } from "./resizable-element"
import { Textarea } from "@/components/ui/textarea"

interface FloatingTextProps {
  id: string
  text: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  onRemove: () => void
  onPositionChange: (id: string, x: number, y: number) => void
  onTextChange: (id: string, text: string) => void
  onSizeChange?: (id: string, width: number, height: number) => void
  onStyleChange?: (
    id: string,
    styles: {
      fontSize?: number
      fontFamily?: string
      fontWeight?: string
      color?: string
    }
  ) => void
  isReadOnly?: boolean
  isSelected?: boolean
  onSelect?: (id: string | null) => void
}

export function FloatingText({
  id,
  text,
  x,
  y,
  width = 200,
  height = 100,
  fontSize = 16,
  fontFamily = "Arial",
  fontWeight = "normal",
  color = "#000000",
  onRemove,
  onPositionChange,
  onTextChange,
  onSizeChange,
  onStyleChange,
  isReadOnly = false,
  isSelected = false,
  onSelect,
}: FloatingTextProps) {
  const [localText, setLocalText] = useState(text)

  useEffect(() => {
    setLocalText(text)
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    onTextChange(id, newText)
  }

  const textStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    color: color,
  }

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
      isReadOnly={isReadOnly}
      minWidth={150}
      minHeight={80}
      isSelected={isSelected}
      onSelect={onSelect}
    >
      <div className="relative h-full w-full rounded-lg border-2 border-gray-300 bg-white p-1 shadow-lg">
        <Textarea
          value={localText}
          onChange={handleTextChange}
          style={textStyle}
          className="h-full w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          readOnly={isReadOnly}
          placeholder="Type text here..."
          onClick={(e) => e.stopPropagation()} // Prevent selecting parent when clicking textarea
        />
      </div>
    </ResizableElement>
  )
}
