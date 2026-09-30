"use client"

import { useState, useRef, useEffect } from "react"
import { Move, X } from "lucide-react"
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
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = elementRef.current?.parentElement
    if (!parent) return
    const updateParentSize = () =>
      setParentSize({ width: parent.clientWidth, height: parent.clientHeight })
    updateParentSize()
    const observer = new ResizeObserver(updateParentSize)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Prop changes come from the persisted collaborative board state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition({ x, y })
    setSize({ width, height })
  }, [x, y, width, height])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return
    // Don't prevent default on buttons or interactive elements
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input") ||
      (e.target as HTMLElement).closest("textarea") ||
      (e.target as HTMLElement).closest("a") ||
      ((e.target as HTMLElement).closest("iframe") &&
        !(e.target as HTMLElement).closest(".move-handle"))
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
    const handlePointerMove = (e: PointerEvent) => {
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

    const handlePointerUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("pointermove", handlePointerMove)
      document.addEventListener("pointerup", handlePointerUp)
      document.addEventListener("pointercancel", handlePointerUp)
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
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
        left: `${parentSize.width ? Math.max(8, Math.min(position.x, parentSize.width - Math.min(size.width, parentSize.width - 16) - 8)) : position.x}px`,
        top: `${parentSize.height ? Math.max(8, Math.min(position.y, parentSize.height - Math.min(size.height, parentSize.height - 16) - 8)) : position.y}px`,
        width: `${parentSize.width ? Math.min(size.width, parentSize.width - 16) : size.width}px`,
        height: `${parentSize.height ? Math.min(size.height, parentSize.height - 16) : size.height}px`,
        cursor: isReadOnly ? "default" : isDragging ? "grabbing" : "grab",
        zIndex: isSelected ? 20 : 10,
        outline: isSelected ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      }}
      onPointerDown={handlePointerDown}
      onFocusCapture={() => onSelect?.(id)}
      tabIndex={isReadOnly ? -1 : 0}
      className="group touch-none focus:outline-none"
    >
      {children}
      {!isReadOnly && (
        <>
          <div
            className={`move-handle absolute -top-3 left-2 z-30 flex h-7 w-7 cursor-move items-center justify-center rounded-full bg-slate-800 text-white shadow transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            aria-label="Move item"
          >
            <Move className="h-3.5 w-3.5" />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className={`absolute -top-2 -right-2 z-20 h-6 w-6 rounded-full p-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          <div
            className={`resize-handle absolute right-0 bottom-0 h-6 w-6 cursor-se-resize rounded-tl-lg bg-blue-500 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
