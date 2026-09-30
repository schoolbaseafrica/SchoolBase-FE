"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Users, AlertCircle, MessageSquare, X } from "lucide-react"
import {
  useWhiteboard,
  useUpdateWhiteboard,
  useUpdateWhiteboardElements,
} from "./_hooks/use-whiteboard"
import { WhiteboardCanvas } from "./_components/whiteboard-canvas"
import { ClassroomChat } from "./_components/classroom-chat"
import { ClassroomAudio } from "./_components/classroom-audio"
import {
  ClassroomBoardBar,
  CollaborationCursors,
} from "./_components/classroom-board-bar"
import { useCollaborationPresence } from "./_hooks/use-collaboration-presence"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/results/empty-state"
import { useClassroomPresence, useClassroomSession } from "@/hooks/use-virtual-classroom"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"
import { toast } from "sonner"

export default function TeacherClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const [activePage, setActivePage] = useState("main")
  const session = useClassroomSession(classId)
  useClassroomPresence(classId, session.data?.status === "live")

  // Enable polling on teacher side to see student changes in real-time
  const {
    data: whiteboard,
    isLoading,
    error,
    collaborationStatus,
  } = useWhiteboard(classId, activePage, Boolean(session.data))
  const updateMutation = useUpdateWhiteboard(classId, activePage)
  const updateElements = useUpdateWhiteboardElements(classId, activePage)
  const presence = useCollaborationPresence(classId, activePage, Boolean(session.data))

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    async (file: File) => {
      if (collaborationStatus !== "connected")
        throw new Error(
          "Whiteboard is reconnecting. Wait for it to reconnect, then upload again."
        )
      const { url } = await VirtualClassroomAPI.uploadWhiteboardImage(classId, file)
      const mediaIndex = Object.keys(imagesData).length + Object.keys(videosData).length
      const newImagesData = {
        ...imagesData,
        [url]: {
          x: 20 + (mediaIndex % 2) * 250,
          y: 20 + Math.floor(mediaIndex / 2) * 175,
          width: 220,
          height: 160,
        },
      }
      setImagesData(newImagesData)
      updateMutation.mutate({ images_data: newImagesData })
    },
    [classId, collaborationStatus, imagesData, videosData, updateMutation]
  )

  const handleRemoveImage = useCallback(
    (url: string) => {
      const newImagesData = { ...imagesData }
      delete newImagesData[url]
      setImagesData(newImagesData)
      updateMutation.mutate({ images_data: newImagesData })
    },
    [imagesData, updateMutation]
  )

  const handleAddVideo = useCallback(
    (url: string) => {
      if (collaborationStatus !== "connected") {
        toast.error(
          "Whiteboard is reconnecting. Wait for it to reconnect, then add the video again."
        )
        return
      }
      const mediaIndex = Object.keys(imagesData).length + Object.keys(videosData).length
      const newVideosData = {
        ...videosData,
        [url]: {
          x: 20 + (mediaIndex % 2) * 250,
          y: 20 + Math.floor(mediaIndex / 2) * 175,
          width: 240,
          height: 135,
        },
      }
      setVideosData(newVideosData)
      updateMutation.mutate({ videos_data: newVideosData })
    },
    [collaborationStatus, imagesData, videosData, updateMutation]
  )

  const handleRemoveVideo = useCallback(
    (url: string) => {
      const newVideosData = { ...videosData }
      delete newVideosData[url]
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

  const handleLegacyRetired = useCallback(() => {
    setCanvasState(null)
    void VirtualClassroomAPI.retireLegacyWhiteboard(classId).catch((retireError) => {
      toast.error(
        retireError instanceof Error
          ? retireError.message
          : "Could not finish migrating the legacy board"
      )
    })
  }, [classId])

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

  const handleEndClass = async () => {
    try {
      await VirtualClassroomAPI.setStatus(classId, "ended")
      toast.success("Classroom ended and attendance was saved")
      router.push("/teacher/timetable")
    } catch (statusError) {
      toast.error(
        statusError instanceof Error ? statusError.message : "Could not end class"
      )
    }
  }

  const pageError = session.error ?? error

  // Check if error is a 403 Forbidden (access denied)
  const isForbiddenError =
    pageError &&
    ((pageError as { response?: { status?: number } })?.response?.status === 403 ||
      (pageError instanceof Error &&
        (pageError.message.includes("403") ||
          pageError.message.includes("Forbidden") ||
          pageError.message.includes("not assigned") ||
          pageError.message.includes("do not have access"))))

  if (pageError) {
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
                  pageError instanceof Error
                    ? pageError.message
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
    <div className="fixed inset-0 flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Minimal header with back button */}
      <div className="flex items-center justify-between border-b bg-white px-2 py-2 md:px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 px-2 md:px-3"
        >
          <ArrowLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-xs font-medium text-gray-700 md:text-sm">
            {session.data?.title ?? "Virtual Classroom"}
          </h1>
          <p className="text-[10px] text-gray-500 capitalize">
            {session.data?.status} · Whiteboard {collaborationStatus}
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          {/* Desktop: Show full toggle */}
          <div className="hidden items-center gap-2 md:flex">
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
            <Button variant="destructive" size="sm" onClick={handleEndClass}>
              End class
            </Button>
          </div>
          {/* Mobile: Show compact toggle and chat button */}
          <div className="flex items-center gap-2 md:hidden">
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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ClassroomAudio
            classroomId={classId}
            canManage={true}
            allowStudentMicrophone={session.data?.allowStudentMicrophone ?? false}
            allowStudentCamera={session.data?.allowStudentCamera ?? false}
            onPermissionChanged={() => void session.refetch()}
          />
          <ClassroomBoardBar
            classroomId={classId}
            activePage={activePage}
            onPageChange={setActivePage}
            canManage={true}
            participants={presence.participants}
          />
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            {/* Whiteboard - takes up remaining space, hidden on mobile when chat is open */}
            <div
              className={`relative flex-1 overflow-hidden ${isChatOpen ? "hidden md:block" : ""}`}
              onPointerMove={presence.sendPointer}
              onPointerLeave={presence.clearPointer}
            >
              <CollaborationCursors cursors={presence.cursors} />
              <WhiteboardCanvas
                key={activePage}
                canvasState={canvasState}
                elements={whiteboard?.excalidraw_elements}
                onSave={handleCanvasSave}
                onElementsChange={updateElements}
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
                onLegacyRetired={handleLegacyRetired}
              />
            </div>
            {/* Chat sidebar - full width on mobile when open, fixed/collapsed width on desktop */}
            <div
              className={`${isChatOpen ? "block" : "hidden"} md:block ${isChatOpen ? "w-full" : ""} ${isChatCollapsed ? "md:w-12" : "md:w-80"} absolute inset-0 z-10 min-h-0 flex-shrink-0 overflow-hidden bg-white transition-all duration-300 md:relative md:inset-auto md:z-auto md:bg-transparent`}
            >
              <ClassroomChat
                classId={classId}
                isReadOnly={false}
                isCollapsed={isChatCollapsed}
                onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
                showCollapseButton={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
