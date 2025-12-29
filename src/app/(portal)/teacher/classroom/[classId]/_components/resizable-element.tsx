"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResizableElementProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  onRemove: () => void
  onPositionChange: (id: string, x: number, y: number) => void
  onSizeChange: (id: string, width: number, height: number) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
  isReadOnly?: boolean
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
}

export function ResizableElement({
  id,
  x,
  y,
  width,
  height,
  onRemove,
  onPositionChange,
  onSizeChange,
  onSelect,
  isSelected = false,
  isReadOnly = false,
  children,
  minWidth = 100,
  minHeight = 60,
}: ResizableElementProps) {
  const [position, setPosition] = useState({ x, y })
  const [size, setSize] = useState({ width, height })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPosition({ x, y })
    setSize({ width, height })
  }, [x, y, width, height])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isReadOnly) return
    // Don't prevent default on buttons or interactive elements
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input") ||
      (e.target as HTMLElement).closest("textarea") ||
      (e.target as HTMLElement).closest("a")
    )
      return

    // Check if clicking on resize handle
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      const parent = elementRef.current?.parentElement
      if (parent && elementRef.current) {
        const parentRect = parent.getBoundingClientRect()
        const rect = elementRef.current.getBoundingClientRect()
        setResizeStart({
          x: e.clientX - parentRect.left,
          y: e.clientY - parentRect.top,
          width: rect.width,
          height: rect.height,
        })
      }
      return
    }

    e.preventDefault()
    e.stopPropagation()

    // Select this element when clicked
    if (onSelect) {
      onSelect(id)
    }

    setIsDragging(true)
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const parent = elementRef.current?.parentElement
      if (!parent) return

      if (isResizing && !isReadOnly) {
        const parentRect = parent.getBoundingClientRect()
        const deltaX = e.clientX - parentRect.left - resizeStart.x
        const deltaY = e.clientY - parentRect.top - resizeStart.y

        const newWidth = Math.max(minWidth, resizeStart.width + deltaX)
        const newHeight = Math.max(minHeight, resizeStart.height + deltaY)

        setSize({ width: newWidth, height: newHeight })
        onSizeChange(id, newWidth, newHeight)
      } else if (isDragging && !isReadOnly) {
        const parentRect = parent.getBoundingClientRect()
        const newX = Math.max(
          0,
          Math.min(
            e.clientX - dragOffset.x - parentRect.left,
            parentRect.width - size.width
          )
        )
        const newY = Math.max(
          0,
          Math.min(
            e.clientY - dragOffset.y - parentRect.top,
            parentRect.height - size.height
          )
        )

        setPosition({ x: newX, y: newY })
        onPositionChange(id, newX, newY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    id,
    onPositionChange,
    onSizeChange,
    isReadOnly,
    size,
    minWidth,
    minHeight,
  ])

  return (
    <div
      ref={elementRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isReadOnly ? "default" : isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 20 : 10,
        outline: isSelected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      }}
      onMouseDown={handleMouseDown}
      tabIndex={isReadOnly ? -1 : 0}
      className="group focus:outline-none"
    >
      {children}
      {!isReadOnly && (
        <>
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 z-20 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          <div
            className="resize-handle absolute right-0 bottom-0 h-4 w-4 cursor-se-resize rounded-tl-lg bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(-45deg, transparent 0%, transparent 30%, rgba(59, 130, 246, 0.5) 30%, rgba(59, 130, 246, 0.5) 50%, transparent 50%)",
            }}
          />
        </>
      )}
    </div>
  )
}
