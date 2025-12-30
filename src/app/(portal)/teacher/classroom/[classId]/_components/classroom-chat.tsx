"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, Square, Loader2 } from "lucide-react"
import { useClassroomMessages, useCreateMessage } from "../_hooks/use-classroom-messages"
import { ClassroomMessage } from "@/lib/classroom-message"
import { ClassroomMessageAPI } from "@/lib/classroom-message"
// Simple date formatting without date-fns dependency
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

interface ClassroomChatProps {
  classId: string
  isReadOnly?: boolean
  senderType?: "teacher" | "student" // Optional - backend determines from token
  senderId?: string // Optional - backend determines from token
}

export function ClassroomChat({ classId, isReadOnly = false }: ClassroomChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [textInput, setTextInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const { data: messages = [], isLoading } = useClassroomMessages(classId, {
    enablePolling: true,
  })
  const createMessageMutation = useCreateMessage(classId)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle text message send
  const handleSendText = useCallback(async () => {
    if (!textInput.trim() || createMessageMutation.isPending) return

    const messageText = textInput.trim()
    setTextInput("")

    try {
      await createMessageMutation.mutateAsync({
        class_id: classId,
        // Backend will determine sender_type and sender_id from token
        text: messageText,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }, [textInput, classId, createMessageMutation])

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType })
        setAudioChunks(chunks)

        // Create File from Blob
        const audioFile = new File(
          [audioBlob],
          `voice-note-${Date.now()}.${recorder.mimeType.includes("webm") ? "webm" : "mp4"}`,
          {
            type: recorder.mimeType,
          }
        )

        // Upload audio file
        try {
          const uploadResult = await ClassroomMessageAPI.uploadAudio(audioFile)

          // Get audio duration
          const audio = new Audio(uploadResult.url)
          audio.addEventListener("loadedmetadata", async () => {
            const duration = audio.duration

            // Create message with audio
            await createMessageMutation.mutateAsync({
              class_id: classId,
              // Backend will determine sender_type and sender_id from token
              audio_url: uploadResult.url,
              audio_duration: duration,
            })
          })

          // Load metadata
          audio.load()
        } catch (error) {
          console.error("Failed to upload audio:", error)
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)

      // Update recording time every second
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Store interval ID to clear later
      ;(recorder as any).intervalId = interval
    } catch (error) {
      console.error("Failed to start recording:", error)
      alert("Failed to access microphone. Please check permissions.")
    }
  }, [classId, createMessageMutation])

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setIsRecording(false)

      // Clear interval
      if ((mediaRecorder as any).intervalId) {
        clearInterval((mediaRecorder as any).intervalId)
      }
    }
  }, [mediaRecorder])

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle audio playback
  const handlePlayAudio = useCallback((audioUrl: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    setPlayingAudioId(messageId)

    audio.onended = () => {
      setPlayingAudioId(null)
      audioRef.current = null
    }

    audio.onerror = () => {
      setPlayingAudioId(null)
      audioRef.current = null
    }

    audio.play()
  }, [])

  // Stop audio playback
  const handleStopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setPlayingAudioId(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [mediaRecorder])

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return "Just now"
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m ago`
      } else if (diffInSeconds < 86400) {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      } else {
        return formatDate(date)
      }
    } catch {
      return ""
    }
  }

  // Check if message is from current user (approximate check)
  // Backend determines sender, so we show all messages but style them differently
  const isOwnMessage = (_message: ClassroomMessage) => {
    // For now, show all messages with same styling
    // Could enhance by storing current user ID in context/token if needed
    return false
  }

  return (
    <div className="flex h-full flex-col border-l bg-white">
      {/* Chat Header */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Class Chat</h2>
        <p className="text-xs text-gray-500">Messages with students</p>
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = isOwnMessage(message)
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {/* Sender name (for other users) */}
                  {!isOwn && (
                    <div className="mb-1 text-xs font-medium opacity-75">
                      {message.sender_name ||
                        (message.sender_type === "teacher" ? "Teacher" : "Student")}
                    </div>
                  )}

                  {/* Text message */}
                  {message.text && (
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {message.text}
                    </div>
                  )}

                  {/* Audio message */}
                  {message.audio_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 ${
                          isOwn
                            ? "bg-blue-400 text-white hover:bg-blue-300"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          if (playingAudioId === message.id) {
                            handleStopAudio()
                          } else {
                            handlePlayAudio(message.audio_url!, message.id)
                          }
                        }}
                      >
                        {playingAudioId === message.id ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        )}
                      </Button>
                      <span className="text-xs opacity-75">
                        {message.audio_duration
                          ? `${Math.round(message.audio_duration)}s`
                          : "Voice"}
                      </span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1 text-xs ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isReadOnly && (
        <div className="border-t bg-white p-4">
          {/* Recording indicator */}
          {isRecording && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm text-red-700">
                  Recording: {formatRecordingTime(recordingTime)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopRecording}
                className="h-6 px-2 text-red-700 hover:bg-red-100"
              >
                <Square className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Text input and buttons */}
          <div className="flex items-center gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={createMessageMutation.isPending || isRecording}
            />
            {!isRecording ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={startRecording}
                  disabled={createMessageMutation.isPending}
                  className="h-10 w-10"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendText}
                  disabled={!textInput.trim() || createMessageMutation.isPending}
                  className="h-10 w-10"
                >
                  {createMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
