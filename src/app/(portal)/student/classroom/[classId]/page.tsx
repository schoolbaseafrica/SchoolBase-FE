"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import {
  useWhiteboard,
  useUpdateWhiteboard,
} from "../../../teacher/classroom/[classId]/_hooks/use-whiteboard"
import { WhiteboardCanvas } from "../../../teacher/classroom/[classId]/_components/whiteboard-canvas"
import { ClassroomChat } from "../../../teacher/classroom/[classId]/_components/classroom-chat"
import { TextBoxData, MediaPosition } from "@/lib/whiteboard"

export default function StudentClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const {
    data: whiteboard,
    isLoading,
    error,
  } = useWhiteboard(classId, { enablePolling: true })

  const [canvasState, setCanvasState] = useState<string | null>(null)
  const [imagesData, setImagesData] = useState<Record<string, MediaPosition>>({})
  const [videosData, setVideosData] = useState<Record<string, MediaPosition>>({})
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([])
  const hasInitializedRef = useRef(false)

  // Log whiteboard query state
  useEffect(() => {
    console.log("[StudentClassroom] Whiteboard query state:", {
      isLoading,
      hasError: !!error,
      errorMessage: error instanceof Error ? error.message : String(error),
      hasData: !!whiteboard,
      classId,
      whiteboardData: whiteboard
        ? {
            id: whiteboard.id,
            class_id: whiteboard.class_id,
            hasCanvasState: !!whiteboard.canvas_state,
            canvasStateLength: whiteboard.canvas_state?.length || 0,
            imagesCount: Object.keys(whiteboard.images_data || {}).length,
            imagesKeys: Object.keys(whiteboard.images_data || {}),
            videosCount: Object.keys(whiteboard.videos_data || {}).length,
            videosKeys: Object.keys(whiteboard.videos_data || {}),
            textBoxesCount: (whiteboard.text_boxes || []).length,
            textBoxes: whiteboard.text_boxes || [],
            fullWhiteboard: whiteboard,
          }
        : null,
    })
  }, [whiteboard, isLoading, error, classId])

  // Sync state from API response - always update for students to see real-time changes
  useEffect(() => {
    if (whiteboard) {
      console.log("[StudentClassroom] Syncing whiteboard data:", {
        hasCanvasState: !!whiteboard.canvas_state,
        canvasStatePreview: whiteboard.canvas_state
          ? whiteboard.canvas_state.substring(0, 100) + "..."
          : "null",
        imagesDataRaw: whiteboard.images_data,
        imagesDataType: typeof whiteboard.images_data,
        imagesDataIsUndefined: whiteboard.images_data === undefined,
        imagesDataIsNull: whiteboard.images_data === null,
        imagesCount: Object.keys(whiteboard.images_data || {}).length,
        videosDataRaw: whiteboard.videos_data,
        videosDataType: typeof whiteboard.videos_data,
        videosDataIsUndefined: whiteboard.videos_data === undefined,
        videosDataIsNull: whiteboard.videos_data === null,
        videosCount: Object.keys(whiteboard.videos_data || {}).length,
        textBoxesRaw: whiteboard.text_boxes,
        textBoxesCount: (whiteboard.text_boxes || []).length,
        fullWhiteboardObject: whiteboard,
      })

      // Ensure we always set valid objects/arrays, never undefined
      const safeImagesData =
        whiteboard.images_data && typeof whiteboard.images_data === "object"
          ? whiteboard.images_data
          : {}
      const safeVideosData =
        whiteboard.videos_data && typeof whiteboard.videos_data === "object"
          ? whiteboard.videos_data
          : {}
      const safeTextBoxes = Array.isArray(whiteboard.text_boxes)
        ? whiteboard.text_boxes
        : []

      console.log("[StudentClassroom] Safe values:", {
        safeImagesData,
        safeVideosData,
        safeTextBoxes,
        imagesCount: Object.keys(safeImagesData).length,
        videosCount: Object.keys(safeVideosData).length,
        textBoxesCount: safeTextBoxes.length,
      })

      setCanvasState(whiteboard.canvas_state || null)
      setImagesData(safeImagesData)
      setVideosData(safeVideosData)
      setTextBoxes(safeTextBoxes)
      hasInitializedRef.current = true
    } else {
      console.log("[StudentClassroom] No whiteboard data to sync")
    }
  }, [whiteboard])

  // Extract image/video URLs from data
  const images = Object.keys(imagesData)
  const videoLinks = Object.keys(videosData)

  const { mutate: updateWhiteboard } = useUpdateWhiteboard(classId)

  // Save function for when students have edit rights
  const handleCanvasSave = useCallback(
    (state: string) => {
      if (!whiteboard?.allow_student_edit) {
        console.log("[StudentClassroom] Student edit not allowed, skipping save")
        return
      }
      console.log("[StudentClassroom] Saving student canvas state")
      // Save student canvas state (it will be visible to teacher but won't persist long-term)
      updateWhiteboard(
        { canvas_state: state },
        {
          onSuccess: () => {
            console.log("[StudentClassroom] Student canvas state saved successfully")
          },
          onError: (error) => {
            console.error(
              "[StudentClassroom] Failed to save student canvas state:",
              error
            )
          },
        }
      )
    },
    [whiteboard?.allow_student_edit, updateWhiteboard]
  )

  if (error) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Failed to load classroom</p>
            <p className="mt-2 text-sm text-red-500">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col bg-white">
      {/* Minimal header with back button */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-sm font-medium text-gray-600">Virtual Classroom</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {isLoading || !hasInitializedRef.current ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading classroom...</span>
        </div>
      ) : (
        <div className="relative flex flex-1 overflow-hidden">
          {/* Whiteboard - takes up remaining space */}
          <div className="flex-1 overflow-hidden">
            <WhiteboardCanvas
              canvasState={canvasState}
              onSave={handleCanvasSave}
              isLoading={isLoading}
              isReadOnly={!whiteboard?.allow_student_edit}
              images={images}
              videoLinks={videoLinks}
              textBoxes={textBoxes}
              imagesData={imagesData}
              videosData={videosData}
              onAddImage={() => {}}
              onRemoveImage={() => {}}
              onAddVideo={() => {}}
              onRemoveVideo={() => {}}
              onAddTextBox={() => {}}
              onUpdateTextBox={() => {}}
              onRemoveTextBox={() => {}}
              onUpdateImagesData={() => {}}
              onUpdateVideosData={() => {}}
              onClearAll={() => {}}
            />
          </div>
          {/* Chat sidebar */}
          <div className="w-80 flex-shrink-0">
            <ClassroomChat classId={classId} isReadOnly={false} />
          </div>
        </div>
      )}
    </div>
  )
}
