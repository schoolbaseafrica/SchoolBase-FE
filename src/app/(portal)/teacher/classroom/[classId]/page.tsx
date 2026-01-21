"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Users, AlertCircle, MessageSquare, X } from "lucide-react"
import { useWhiteboard, useUpdateWhiteboard } from "./_hooks/use-whiteboard"
import { WhiteboardCanvas } from "./_components/whiteboard-canvas"
import { ClassroomChat } from "./_components/classroom-chat"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/results/empty-state"

export default function TeacherClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  // Enable polling on teacher side to see student changes in real-time
  const {
    data: whiteboard,
    isLoading,
    error,
  } = useWhiteboard(classId, { enablePolling: true })
  const updateMutation = useUpdateWhiteboard(classId)

  const [canvasState, setCanvasState] = useState<string | null>(null)
  const [imagesData, setImagesData] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({})
  const [videosData, setVideosData] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({})
  const [textBoxes, setTextBoxes] = useState<
    Array<{
      id: string
      text: string
      x: number
      y: number
      width: number
      height: number
    }>
  >([])

  // Track if we've initialized from API data
  const hasInitializedRef = useRef(false)

  // Mobile chat sidebar state
  const [isChatOpen, setIsChatOpen] = useState(false)
  // Desktop chat collapse state
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  // Sync from API - always update canvas state to see student changes in real-time
  useEffect(() => {
    if (whiteboard) {
      // Always sync canvas state from API to see student drawings
      setCanvasState(whiteboard.canvas_state || null)
      setImagesData(whiteboard.images_data || {})
      setVideosData(whiteboard.videos_data || {})
      setTextBoxes(whiteboard.text_boxes || [])
      hasInitializedRef.current = true
    }
  }, [whiteboard])

  // Extract image/video URLs from data
  const images = Object.keys(imagesData)
  const videoLinks = Object.keys(videosData)

  // Log current state before rendering
  useEffect(() => {
    console.log("[TeacherClassroom] Current state before render:", {
      canvasState: canvasState ? `Length: ${canvasState.length}` : "null",
      imagesCount: images.length,
      images,
      videoLinksCount: videoLinks.length,
      videoLinks,
      textBoxesCount: textBoxes.length,
      textBoxes,
      hasInitialized: hasInitializedRef.current,
    })
  }, [canvasState, images, videoLinks, textBoxes])

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleCanvasSave = useCallback(
    (state: string) => {
      setCanvasState(state)

      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      // Set new timer to save after 1 second of inactivity
      saveTimerRef.current = setTimeout(() => {
        updateMutation.mutate({ canvas_state: state })
      }, 1000)
    },
    [updateMutation]
  )

  const handleAddImage = useCallback(
    (url: string) => {
      const newImagesData = {
        ...imagesData,
        [url]: {
          x: Math.random() * 200 + 50,
          y: Math.random() * 200 + 50,
          width: 200,
          height: 150,
        },
      }
      setImagesData(newImagesData)
      updateMutation.mutate({ images_data: newImagesData })
    },
    [imagesData, updateMutation]
  )

  const handleRemoveImage = useCallback(
    (url: string) => {
      const { [url]: removed, ...newImagesData } = imagesData
      setImagesData(newImagesData)
      updateMutation.mutate({ images_data: newImagesData })
    },
    [imagesData, updateMutation]
  )

  const handleAddVideo = useCallback(
    (url: string) => {
      const newVideosData = {
        ...videosData,
        [url]: {
          x: Math.random() * 200 + 50,
          y: Math.random() * 200 + 50,
          width: 400,
          height: 225,
        },
      }
      setVideosData(newVideosData)
      updateMutation.mutate({ videos_data: newVideosData })
    },
    [videosData, updateMutation]
  )

  const handleRemoveVideo = useCallback(
    (url: string) => {
      const { [url]: removed, ...newVideosData } = videosData
      setVideosData(newVideosData)
      updateMutation.mutate({ videos_data: newVideosData })
    },
    [videosData, updateMutation]
  )

  const handleAddTextBox = useCallback(
    (textBox: {
      id: string
      text: string
      x: number
      y: number
      width: number
      height: number
      fontSize?: number
      fontFamily?: string
      fontWeight?: string
      color?: string
    }) => {
      const newTextBox = {
        ...textBox,
        fontSize: textBox.fontSize || 16,
        fontFamily: textBox.fontFamily || "Arial",
        fontWeight: textBox.fontWeight || "normal",
        color: textBox.color || "#000000",
      }
      const newTextBoxes = [...textBoxes, newTextBox]
      setTextBoxes(newTextBoxes)
      updateMutation.mutate({ text_boxes: newTextBoxes })
    },
    [textBoxes, updateMutation]
  )

  const handleUpdateTextBox = useCallback(
    (
      id: string,
      updates: Partial<{
        text: string
        x: number
        y: number
        width: number
        height: number
        fontSize?: number
        fontFamily?: string
        fontWeight?: string
        color?: string
      }>
    ) => {
      const newTextBoxes = textBoxes.map((tb) =>
        tb.id === id ? { ...tb, ...updates } : tb
      )
      setTextBoxes(newTextBoxes)
      updateMutation.mutate({ text_boxes: newTextBoxes })
    },
    [textBoxes, updateMutation]
  )

  const handleRemoveTextBox = useCallback(
    (id: string) => {
      const newTextBoxes = textBoxes.filter((tb) => tb.id !== id)
      setTextBoxes(newTextBoxes)
      updateMutation.mutate({ text_boxes: newTextBoxes })
    },
    [textBoxes, updateMutation]
  )

  // Save position/size changes to backend (debounced)
  const positionsSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const handleUpdateImagesData = useCallback(
    (data: Record<string, { x: number; y: number; width: number; height: number }>) => {
      setImagesData(data)

      if (positionsSaveTimerRef.current) {
        clearTimeout(positionsSaveTimerRef.current)
      }

      positionsSaveTimerRef.current = setTimeout(() => {
        updateMutation.mutate({ images_data: data })
      }, 1000)
    },
    [updateMutation]
  )

  const handleUpdateVideosData = useCallback(
    (data: Record<string, { x: number; y: number; width: number; height: number }>) => {
      setVideosData(data)

      if (positionsSaveTimerRef.current) {
        clearTimeout(positionsSaveTimerRef.current)
      }

      positionsSaveTimerRef.current = setTimeout(() => {
        updateMutation.mutate({ videos_data: data })
      }, 1000)
    },
    [updateMutation]
  )

  // Handle clearing everything (canvas + all elements) and save to backend
  const handleClearAll = useCallback(() => {
    setImagesData({})
    setVideosData({})
    setTextBoxes([])
    setCanvasState(null)
    updateMutation.mutate({
      images_data: {},
      videos_data: {},
      text_boxes: [],
      canvas_state: null,
    })
  }, [updateMutation])

  // Handle toggling student edit permission
  const handleToggleStudentEdit = useCallback(
    (checked: boolean) => {
      console.log("[TeacherClassroom] Toggling student edit permission to:", checked)
      updateMutation.mutate(
        {
          allow_student_edit: checked,
        },
        {
          onSuccess: () => {
            console.log("[TeacherClassroom] Student edit permission updated successfully")
          },
          onError: (error) => {
            console.error(
              "[TeacherClassroom] Failed to update student edit permission:",
              error
            )
          },
        }
      )
    },
    [updateMutation]
  )

  // Check if error is a 403 Forbidden (access denied)
  const isForbiddenError =
    error &&
    ((error as any)?.response?.status === 403 ||
      (error instanceof Error &&
        (error.message.includes("403") ||
          error.message.includes("Forbidden") ||
          error.message.includes("not assigned") ||
          error.message.includes("do not have access"))))

  if (error) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/teacher")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
          {isForbiddenError ? (
            <div className="w-full max-w-md">
              <EmptyState
                icon={AlertCircle}
                title="Access Restricted"
                description="You are not assigned as a teacher for this class. Please contact your administrator to be assigned to this class before accessing the virtual classroom."
                action={
                  <Button onClick={() => router.push("/teacher")} className="mt-4">
                    Go to Dashboard
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="w-full max-w-md">
              <EmptyState
                icon={AlertCircle}
                title="Failed to Load Classroom"
                description={
                  error instanceof Error
                    ? error.message
                    : "An unexpected error occurred while loading the classroom. Please try again later."
                }
                action={
                  <div className="mt-4 flex justify-center gap-2">
                    <Button variant="outline" onClick={() => router.push("/teacher")}>
                      Go to Dashboard
                    </Button>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col bg-white">
      {/* Minimal header with back button */}
      <div className="flex items-center justify-between border-b bg-white px-2 py-2 md:px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 px-2 md:px-3">
          <ArrowLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <h1 className="text-xs font-medium text-gray-600 md:text-sm">Virtual Classroom</h1>
        <div className="flex items-center gap-1 md:gap-3">
          {/* Desktop: Show full toggle */}
          <div className="hidden md:flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <Label
              htmlFor="student-edit-toggle"
              className="cursor-pointer text-xs text-gray-600"
            >
              Allow Student Editing
            </Label>
            <Switch
              id="student-edit-toggle"
              checked={whiteboard?.allow_student_edit ?? false}
              onCheckedChange={handleToggleStudentEdit}
            />
          </div>
          {/* Mobile: Show compact toggle and chat button */}
          <div className="flex md:hidden items-center gap-2">
            <Switch
              id="student-edit-toggle-mobile"
              checked={whiteboard?.allow_student_edit ?? false}
              onCheckedChange={handleToggleStudentEdit}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="h-8 w-8 p-0"
              title={isChatOpen ? "Close chat" : "Open chat"}
            >
              {isChatOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading classroom...</span>
        </div>
      ) : (
        <div className="relative flex flex-1 overflow-hidden">
          {/* Whiteboard - takes up remaining space, hidden on mobile when chat is open */}
          <div className={`flex-1 overflow-hidden ${isChatOpen ? 'hidden md:block' : ''}`}>
            <WhiteboardCanvas
              canvasState={canvasState}
              onSave={handleCanvasSave}
              isLoading={isLoading}
              isReadOnly={false}
              images={images}
              videoLinks={videoLinks}
              textBoxes={textBoxes}
              imagesData={imagesData}
              videosData={videosData}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              onAddVideo={handleAddVideo}
              onRemoveVideo={handleRemoveVideo}
              onAddTextBox={handleAddTextBox}
              onUpdateTextBox={handleUpdateTextBox}
              onRemoveTextBox={handleRemoveTextBox}
              onUpdateImagesData={handleUpdateImagesData}
              onUpdateVideosData={handleUpdateVideosData}
              onClearAll={handleClearAll}
            />
          </div>
          {/* Chat sidebar - full width on mobile when open, fixed/collapsed width on desktop */}
          <div className={`${isChatOpen ? 'block' : 'hidden'} md:block ${isChatOpen ? 'w-full' : ''} ${isChatCollapsed ? 'md:w-12' : 'md:w-80'} flex-shrink-0 absolute md:relative inset-0 md:inset-auto z-10 md:z-auto bg-white md:bg-transparent transition-all duration-300`}>
            <ClassroomChat 
              classId={classId} 
              isReadOnly={false}
              isCollapsed={isChatCollapsed}
              onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
              showCollapseButton={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
